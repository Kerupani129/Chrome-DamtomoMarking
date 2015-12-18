// 
// クエリ文字列取得
// 
// http://www.ipentec.com/document/document.aspx?page=javascript-get-parameter
// 
function GetQueryString() {
	if (1 < document.location.search.length) {
		// 最初の1文字 (?記号) を除いた文字列を取得する
		var query = document.location.search.substring(1);
		
		// クエリの区切り記号 (&) で文字列を配列に分割する
		var parameters = query.split('&');
		
		var result = new Object();
		for (var i = 0; i < parameters.length; i++) {
			// パラメータ名とパラメータ値に分割する
			var element = parameters[i].split('=');
			
			var paramName = decodeURIComponent(element[0]);
			var paramValue = decodeURIComponent(element[1]);
			
			// パラメータ名をキーとして連想配列に追加する
			result[paramName] = decodeURIComponent(paramValue);
		}
		return result;
	}
	return null;
}

// 
// 基本情報 取得
// 
function getBasicInfo(MarkingInfo) {
	
	// id の取得
	var param = GetQueryString();
	MarkingInfo['karaokeContributeId'] = param['karaokeContributeId'];
	
	// 楽曲情報取得
	var info = $('div#info');
	
	MarkingInfo['date'] = info.find('p.date').text().replace(/^[^：]*：([0-9]{4})\/([0-9]{2})\/([0-9]{2})\s*$/g, '$1-$2-$3');
	
	MarkingInfo['requestNo'] = $('input#requestNo').val();
	MarkingInfo['artist']    = info.find('p.song_artist').text().replace(/^\s+|\s+$/g, '');
	MarkingInfo['contents']  = info.find('p.song_title') .text().replace(/^\s+|\s+$/g, '');
	
}

// 
// メイン
// 
	var MarkingInfo = {};
	
	// データ 取得
	getBasicInfo(MarkingInfo);
	ParseUtils.getMarkingInfo(MarkingInfo);
	
	// データ 出力
	/* HTML */
	var table = $('div#midashis').parent('div').children('table');
	table.html(
		'<tr>\n' +
		'	<td colspan="2" rowspan="3">\n' +
		'		<div id="chart" style="width: 300px; height: 200px;">\n' +
		'			音程: '       + MarkingInfo['interval']           + '<br>\n' +
		'			安定性: '     + MarkingInfo['stability']          + '<br>\n' +
		'			表現力: '     + MarkingInfo['expressive']         + '<br>\n' +
		'			リズム ※1: ' + MarkingInfo['rhythm']             + '<br>\n' +
		'			V&L: '        + MarkingInfo['vibratoAndLongTone'] + '\n' +
		'		</div>\n' +
		'	</td>\n' +
		'	<th>総合得点</th>\n' +
		'	<td>' + (MarkingInfo['milliPoint'] / 1000).toFixed(3) + ' 点</td>\n' +
		'</tr>\n' +
		'<tr>\n' +
		'	<th>歌唱タイプ</th>\n' +
		'	<td class="kasyotype">\n' +
		'		<span>\n' +
		'			<a target="_blank" href="/membership/import/marking/singing_type.html?singing_type=' + encodeURIComponent(MarkingInfo['commentNumberMessage']) + '">' + MarkingInfo['commentNumberMessage'] + '</a>\n' +
		'		</span>\n' +
		'	</td>\n' +
		'</tr>\n' +
		'<tr>\n' +
		'	<td colspan="2" style="text-align: left;">\n' +
		'		※1 … DAM★とも精密採点では正確なリズムの点数が分からないため、おおよその予想値になっています<br>\n' +
		'		※2 … 歌唱者の音域は、楽曲の音域内で示されています\n' +
		'	</td>\n' +
		'</tr>\n' +
		'<tr>\n' +
		'	<th>安定性</th>\n' +
		'	<td>\n' +
		'		震えがち\n' +
		'		<img alt="安定性" width="80" src="/membership/images/accurateScoreDx/stability/' + MarkingInfo['stability10'] + '.jpg">\n' +
		'		まっすぐ\n' +
		'	</td>\n' +
		'	<th>ロングトーン</th>\n' +
		'	<td>\n' +
		'		上手さ\n' +
		'		<img alt="ロングトーンの上手さ" width="80" src="/membership/images/accurateScoreDx/longToneScore/' + MarkingInfo['longToneScore'] + '.jpg">\n' +
		'	</td>\n' +
		'</tr>\n' +
		'<tr>\n' +
		'	<th>表現力</th>\n' +
		'	<td>\n' +
		'		抑揚\n' +
		'		<img alt="抑揚" width="80" src="/membership/images/accurateScoreDx/intonation/' + MarkingInfo['intonation'] + '.jpg">\n' +
		'		しゃくり ' + MarkingInfo['shakuriCount'] + ' 回<br>\n' +
		'		こぶし '   + MarkingInfo['kobushiCount'] + ' 回　\n' +
		'		フォール ' + MarkingInfo['fallCount']    + ' 回\n' +
		'	</td>\n' +
		'	<th>ビブラート</th>\n' +
		'	<td>\n' +
		'		上手さ\n' +
		'		<img alt="ビブラートの上手さ" width="80" src="/membership/images/accurateScoreDx/vibratoScore/' + MarkingInfo['vibratoScore'] + '.jpg">\n' +
		'		<img alt="ビブラートタイプ" width="80" src="/membership/images/accurateScoreDx/vibratoType/' + MarkingInfo['vibratoType'] + '.gif"><br>\n' +
		'		合計 '   + (MarkingInfo['vibratoTotalDeciSeconds'] / 10).toFixed(1) + ' 秒　\n' +
		'		タイプ <a target="_blank" href="/membership/import/marking/vibrato_description.html">' + ParseUtils.getVibratoTypeName(MarkingInfo['vibratoType']) + '</a>\n' +
		'	</td>\n' +
		'</tr>\n' +
		'<tr>\n' +
		'	<th>リズム</th>\n' +
		'	<td>\n' +
		'		タメ\n' +
		'		<img alt="リズム" width="80" src="/membership/images/accurateScoreDx/rhythm/' + MarkingInfo['timing'] + '.jpg">\n' + // サイト側で 11段階 の数値から 7段階 の表示にしてくれる
		'		走り\n' +
		'	</td>\n' +
		'	<th>音域</th>\n' +
		'	<td>\n' +
		'		歌唱者 ' + ParseUtils.getPitchName(MarkingInfo['minVoiceRange']) + ' ～ ' + ParseUtils.getPitchName(MarkingInfo['maxVoiceRange']) + ' ※2<br>\n' +
		'		楽曲 '   + ParseUtils.getPitchName(MarkingInfo['minRange'])      + ' ～ ' + ParseUtils.getPitchName(MarkingInfo['maxRange'])      + '\n' +
		'	</td>\n' +
		'</tr>\n'
	);
	table.after($(
		'<table class="sei" style="table-layout: fixed;">\n' +
		'	<tr>\n' +
		'		<th style="width: 80px;">エクスポート</th>\n' +
		'		<td id="export_opt" style="width: 100px;">\n' +
		'			<select name="mode" style="width: 100%;">\n' +
		'				<option value="csv">CSV</option>\n' +
		'				<option value="tabs">タブ区切り</option>\n' +
		'				<option value="line">行区切り</option>\n' +
		'				<option value="html">HTML</option>\n' +
		'				<option value="tcl">TCLリスト</option>\n' +
		'				<option value="insert">INSERT (SQL)</option>\n' +
		'				<option value="movie">歌唱の軌跡</option>\n' +
		'			</select><br>\n' +
		'			<label><input name="headers" type="checkbox">ヘッダー表示</label><br>\n' +
		'			<button name="copy" type="button">全選択コピー</button>\n' +
		'		</td>\n' +
		'		<td style="text-align: left;">\n' +
		'			<code><textarea id="export" style="width: 100%; height: 100px; overflow: auto; word-wrap: break-word; border: thin solid #CCC;" contenteditable="true">' + ParseUtils.exportMarkingInfo('csv', false, [MarkingInfo]) + '</textarea></code>\n' +
		'		</td>\n' +
		'	</tr>\n' +
		'<table>\n'
	));
	
	/* バインド */
	$(document).ready(function() {
		$('select[name=mode]').change(function() {
			var val = $('select[name=mode]').val();
			var checked = $('input[name=headers]').prop("checked");
			$('textarea#export').val(ParseUtils.exportMarkingInfo(val, checked, [MarkingInfo]));
		});
		$('input[name=headers]').change(function() {
			var val = $('select[name=mode]').val();
			var checked = $('input[name=headers]').prop("checked");
			$('textarea#export').val(ParseUtils.exportMarkingInfo(val, checked, [MarkingInfo]));
		});
		$('button[name=copy]').click(function() {
			$('textarea#export').select();
			document.execCommand("copy");
		});
		$('textarea#export').focus(function() {
			$(this).select();
		}).click(function() {
			$(this).select();
			return false;
		});
	});
	
	/* チャート表示 */
	$(function () {
		$('div#chart').highcharts({
			
			credits: {
				enabled: false
			},
			
			chart: {
				polar: true
			},
			
			title: {
				style: {
					display: 'none'
				}
			},
			
			xAxis: {
				categories: [
					'音程',
					'安定性',
					'表現力',
					'リズム ※1',
					'V&L'
				],
				tickmarkPlacement: 'on',
				lineWidth: 0
			},
			
			yAxis: {
				gridLineInterpolation: 'polygon',
				labels: {
					enabled: false
				},
				lineWidth: 0,
				min: 0,
				max: 100,
				tickAmount: 6
			},
			
			plotOptions: {
				series: {
					dataLabels: {
						enabled: true
					},
					enableMouseTracking: false,
					animation: false
				}
			},
			
			series: [{
				showInLegend: false,
				type: 'area',
				data: [MarkingInfo['interval'], MarkingInfo['stability'], MarkingInfo['expressive'], MarkingInfo['rhythm'], MarkingInfo['vibratoAndLongTone']],
				pointPlacement: 'on'
			}]
			
		});
	});
