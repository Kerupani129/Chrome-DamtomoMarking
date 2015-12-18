// 
// ParseUtils 静的クラス
// 
var ParseUtils = {
	
	// 定数
	/* カラム名 */
	columns: [
		"日付",
		
		"リクエストNo.",
		"アーティスト名",
		"曲名",
		
		"点数",
		"チャート合計値 (予想値)",
		"音程",
		"安定性",
		"表現力",
		"リズム (予想値)",
		"ビブラート & ロングトーン",
		
		"安定性 (10)",
		
		"抑揚",
		"しゃくり",
		"こぶし",
		"フォール",
		
		"ロングトーンの上手さ",
		"ビブラートの上手さ",
		"ビブラートタイプ (id)",
		"ビブラートタイプ (文字列)",
		"ビブラート合計秒数",
		
		"リズム (0:走り; 10:タメ)",
		"リズム (+3:走り; -3:タメ)",
		
		"最高音 (楽曲; id)",
		"最低音 (楽曲; id)",
		"最高音 (歌唱者; id)",
		"最低音 (歌唱者; id)",
		"最高音 (楽曲; 文字列)",
		"最低音 (楽曲; 文字列)",
		"最高音 (歌唱者; 文字列)",
		"最低音 (歌唱者; 文字列)",
		
		"歌唱タイプ (id)",
		"歌唱タイプ (文字列)",
		
		"録音合計秒数"
	], 
	
	// 
	// 全角半角を区別して長さ（文字数）を取得する
	// 
	// http://shanabrian.com/web/javascript/string-length.php
	// 
	strLength: function(str, encode) {
		var count     = 0,
			setEncode = 'Shift_JIS',
			c         = '';
		
		if (encode && encode !== '') {
			if (encode.match(/^(SJIS|Shift[_\-]JIS)$/i)) {
				setEncode = 'Shift_JIS';
			} else if (encode.match(/^(UTF-?8)$/i)) {
				setEncode = 'UTF-8';
			}
		}
		
		for (var i = 0, len = str.length; i < len; i++) {
			c = str.charCodeAt(i);
			
			if (setEncode === 'UTF-8') {
				if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
					count += 1;
				} else {
					count += 2;
				}
			} else if (setEncode === 'Shift_JIS') {
				if ((c >= 0x0 && c < 0x81) || (c == 0xa0) || (c >= 0xa1 && c < 0xdf) || (c >= 0xfd && c < 0xff)) {
					count += 1;
				} else {
					count += 2;
				}
			}
		}
		
		return count;
	},
	
	// 
	// ビブラートタイプ名 取得
	// 
	getVibratoTypeName: function(type) {
		
		var vibratoTypeName = [
			'ノンビブ形(N)',
			'ボックス型(A-1)', 'ボックス型(B-1)', 'ボックス型(C-1)',
			'ボックス型(A-2)', 'ボックス型(B-2)', 'ボックス型(C-2)',
			'ボックス型(A-3)', 'ボックス型(B-3)', 'ボックス型(C-3)',
			'上昇形(D)', '下降形(E)', '縮小形(F)', '拡張形(G)', 'ひし形(H)'
		];
		
		return vibratoTypeName[type];
		
	},
	
	// 
	// 音程名 取得
	// 
	getPitchName: function(pitch) {
		
		var octave = [
			'lowlowlowlow', 'lowlowlow', 'lowlow', 'low',
			'mid1', 'mid2',
			'hi', 'hihi', 'hihihi', 'hihihihi', 'hihihihihi'
		];
		
		var note = [
			'C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'
		];
		
		return octave[Math.floor((4 + pitch) / 12)] + note[pitch % 12];
		
	},
	
	// 
	// リズムを 11 段階から符号付 7 段階に (文字列)
	// 
	convertRhythm11to7: function(rhythm11) {
		
		switch (rhythm11) {
		case 0:
			return '+3';
		case 1:
			return '+3';
		case 2:
			return '+2';
		case 3:
			return '+2';
		case 4:
			return '+1';
		case 5:
			return ' 0';
		case 6:
			return '-1';
		case 7:
			return '-2';
		case 8:
			return '-2';
		case 9:
			return '-3';
		case 10:
			return '-3';
		}
		
	},
	
	// 
	// 採点情報 取得
	// 
	// ※注意
	//     基本情報 MarkingInfo['karaokeContributeId'] が既に取得されていなければならない
	// 
	getMarkingInfo: function(MarkingInfo) {
		
		// 採点情報取得
		/* xml の取得 */
		var marking;
		$.ajax({
			async: false, // 同期にする
			dataType: 'xml',
			url: 'http://www.clubdam.com/app/damtomo/karaokePost/GetAccurateScoreDxResultXML.do?karaokeContributeId=' + MarkingInfo['karaokeContributeId'],
			beforeSend: function(xhr) {
				xhr.overrideMimeType("text/xml; charset=Shift_JIS");
			},
			success: function(data) {
				var xml = $(data);
				marking = xml.find('document > data > marking');
			}
		});
		
		/* 採点情報 パース */
		MarkingInfo['milliPoint'] = parseInt(marking.text());
		
		MarkingInfo['interval']           = parseInt(marking.attr('interval'));
		MarkingInfo['stability']          = parseInt(marking.attr('stability'));
		MarkingInfo['expressive']         = parseInt(marking.attr('expressive'));
		MarkingInfo['vibratoAndLongTone'] = parseInt(marking.attr('vibratoAndLongTone'));
		// 正確なリズムの点数がわからないので予測
		var timing = Math.floor(parseInt(marking.attr('rhythm')) / 10); // たぶんこれが正しいタイミング
		timing = (timing > 10) ? (10) : (timing < 0) ? (0) : (timing);
		var original_timing = parseInt(marking.attr('timing'));
		var rhythm;
		if (Number.isNaN(original_timing)) { // NaN だったら
			switch (timing) { // 値はかなりテキトーです (^^;
			case 0:
				rhythm = 5;
				break;
			case 1:
				rhythm = 28;
				break;
			case 2:
				rhythm = 36;
				break;
			case 3:
				rhythm = 55;
				break;
			case 4:
				rhythm = 75;
				break;
			case 5:
				rhythm = 97;
				break;
			case 6:
				rhythm = 96;
				break;
			case 7:
				rhythm = 90;
				break;
			case 8:
				rhythm = 80;
				break;
			case 9:
				rhythm = 70;
				break;
			case 10:
				rhythm = 60;
				break;
			}
		} else { // NaN ではなかったら
			rhythm = parseInt(original_timing) * 10 + 5; 
		}
		MarkingInfo['rhythm'] = (rhythm > 100) ? (100) : (rhythm < 0) ? (0) : (rhythm);
		
		MarkingInfo['maxRange'] = parseInt(marking.attr('maxRange'));
		MarkingInfo['minRange'] = parseInt(marking.attr('minRange'));
		MarkingInfo['maxVoiceRange'] = parseInt(marking.attr('maxVoiceRange'));
		MarkingInfo['minVoiceRange'] = parseInt(marking.attr('minVoiceRange'));
		
		MarkingInfo['kobushiCount'] = parseInt(marking.attr('kobushiCount'));
		MarkingInfo['shakuriCount'] = parseInt(marking.attr('shakuriCount'));
		MarkingInfo['fallCount']    = parseInt(marking.attr('fallCount'));
		
		var stability10 = Math.floor(MarkingInfo['stability'] / 10) + 1;
		MarkingInfo['stability10'] = (stability10 > 10) ? (10) : (stability10 < 0) ? (0) : (stability10);
		MarkingInfo['intonation']  = parseInt(marking.attr('intonation'));
		MarkingInfo['timing']      = timing;
		MarkingInfo['longToneScore']           = parseInt(marking.attr('longToneScore'));
		MarkingInfo['vibratoScore']            = parseInt(marking.attr('vibratoScore'));
		MarkingInfo['vibratoType']             = parseInt(marking.attr('vibratoType'));
		MarkingInfo['vibratoTotalDeciSeconds'] = parseInt(marking.attr('vibratoTotalTime'));
		MarkingInfo['commentNumber']        = parseInt(marking.attr('commentNumber'));
		MarkingInfo['commentNumberMessage'] = marking.attr('commentNumberMessage');
		MarkingInfo['recodeMilliSeconds'] = parseInt(marking.attr('recodeTime'));
		
		// ストリーミング URL 取得
		/* xml の取得 */
		var streamingUrl;
		$.ajax({
			async: false, // 同期にする
			dataType: 'xml',
			url: 'http://www.clubdam.com/app/damtomo/karaokePost/GetStreamingKrkUrlXML.do?karaokeContributeId=' + MarkingInfo['karaokeContributeId'],
			beforeSend: function(xhr) {
				xhr.overrideMimeType("text/xml; charset=Shift_JIS");
			},
			success: function(data) {
				var xml = $(data);
				streamingUrl = xml.find('document > data > streamingUrl').text();
			}
		});
		
		/* PC 用から スマホ 用 に URL を変換 */
		MarkingInfo['streamingUrl'] = streamingUrl.replace(
			'http://cds1.clubdam.com/phds-cds1/damtomo/kiseki/mp4/',
			'http://cds1.clubdam.com/vhls-cds1/damtomo/kiseki/mp4/'
		).replace(
			'.mp4.f4m',
			'.mp4.m3u8'
		);
		
	},
	
	// 
	// 採点情報 エクスポート
	// 
	exportMarkingInfo: function(type, header, MarkingInfoList) {
		
		var result = '';
		
		for (var n = 0; n < MarkingInfoList.length; n++) {
			
			var MarkingInfo = MarkingInfoList[n];
			
			var data = [
				MarkingInfo['date'],
				
				MarkingInfo['requestNo'],
				MarkingInfo['artist'],
				MarkingInfo['contents'],
				
				(MarkingInfo['milliPoint'] / 1000).toFixed(3),
				(MarkingInfo['interval'] + MarkingInfo['stability'] + MarkingInfo['expressive'] + MarkingInfo['rhythm'] + MarkingInfo['vibratoAndLongTone']),
				MarkingInfo['interval'],
				MarkingInfo['stability'],
				MarkingInfo['expressive'],
				MarkingInfo['rhythm'],
				MarkingInfo['vibratoAndLongTone'],
				
				MarkingInfo['stability10'],
				
				MarkingInfo['intonation'],
				MarkingInfo['shakuriCount'],
				MarkingInfo['kobushiCount'],
				MarkingInfo['fallCount'],
				
				MarkingInfo['longToneScore'],
				MarkingInfo['vibratoScore'],
				MarkingInfo['vibratoType'],
				this.getVibratoTypeName(MarkingInfo['vibratoType']),
				(MarkingInfo['vibratoTotalDeciSeconds'] / 10).toFixed(1),
				
				MarkingInfo['timing'],
				this.convertRhythm11to7(MarkingInfo['timing']),
				
				MarkingInfo['maxRange'],
				MarkingInfo['minRange'],
				MarkingInfo['maxVoiceRange'],
				MarkingInfo['minVoiceRange'],
				this.getPitchName(MarkingInfo['maxRange']),
				this.getPitchName(MarkingInfo['minRange']),
				this.getPitchName(MarkingInfo['maxVoiceRange']),
				this.getPitchName(MarkingInfo['minVoiceRange']),
				
				MarkingInfo['commentNumber'],
				MarkingInfo['commentNumberMessage'],
				
				(MarkingInfo['recodeMilliSeconds'] / 1000).toFixed(3)
			];
			
			switch (type) {
			case 'csv':
				if (header && (n == 0)) {
					for (var i = 0; i < this.columns.length; i ++) {
						result += '"' + String(this.columns[i]).replace(/\"/g, '""') + '"';
						if (i != this.columns.length - 1) result += ', ';
					}
					result += '\n';
				}
				for (var i = 0; i < data.length; i ++) {
					result += '"' + String(data[i]).replace(/\"/g, '""') + '"';
					if (i != data.length - 1) result += ', ';
				}
				result += '\n';
				break;
			case 'tabs':
				if (header && (n == 0)) {
					for (var i = 0; i < this.columns.length; i ++) {
						result += String(this.columns[i]).replace(/\t|\n/g, ' ');
						if (i != this.columns.length - 1) result += '\t';
					}
					result += '\n';
				}
				for (var i = 0; i < data.length; i ++) {
					result += String(data[i]).replace(/\t|\n/g, ' ');
					if (i != data.length - 1) result += '\t';
				}
				result += '\n';
				break;
			case 'line':
				for (var i = 0; i < this.columns.length; i ++) {
					for (var j = this.strLength(this.columns[i]); j < 25 ; j++) {
						result += ' ';
					}
					result +=
						String(this.columns[i]).replace(/\n/g, ' ').replace(/=/g, '') +
						' = ' +
						String(data   [i]).replace(/\n/g, ' ') +
						'\n';
				}
				result += '\n';
				break;
			case 'html':
				if (header && (n == 0)) {
					result += '<tr>\n';
					for (var i = 0; i < this.columns.length; i ++) {
						result += '\t<th>' + $('<th/>').text(String(this.columns[i])).html() +'</th>\n';
					}
					result += '</tr>\n';
				}
				result += '<tr>\n';
				for (var i = 0; i < data.length; i ++) {
					result += '\t<td>' + $('<td/>').text(String(data[i])).html() +'</td>\n';
				}
				result += '</tr>\n';
				break;
			case 'tcl':
				if (header && (n == 0)) {
					for (var i = 0; i < this.columns.length; i ++) {
						result += '"' + String(this.columns[i]).replace(/\"/g, '\\"') + '"';
						if (i != this.columns.length - 1) result += ' ';
					}
					result += '\n';
				}
				for (var i = 0; i < data.length; i ++) {
					result += '"' + String(data[i]).replace(/\"/g, '\\"') + '"';
					if (i != data.length - 1) result += ' ';
				}
				result += '\n';
				break;
			case 'insert':
				result += 'INSERT INTO table';
				if (header) {
					result += '(';
					for (var i = 0; i < this.columns.length; i ++) {
						result += "'" + String(this.columns[i]).replace(/\'/g, "''") + "'";
						if (i != this.columns.length - 1) result += ', ';
					}
					result += ')';
				}
				result += ' VALUES(';
				for (var i = 0; i < data.length; i ++) {
					result += "'" + String(data[i]).replace(/\'/g, "''") + "'";
					if (i != data.length - 1) result += ', ';
				}
				result += ');\n';
				break;
			case 'movie':
				if (header) result += 'hls://';
				result += MarkingInfo['streamingUrl'] + '\n';
				break;
			}
			
		}
		
		return result;
		
	}
	
}
