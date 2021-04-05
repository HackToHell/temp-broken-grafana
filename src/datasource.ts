import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  toDataFrame,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
import _ from 'lodash';

var json = `{"response": {"data": {"columns": [{"name": "timestamp"}, {"function": "mean", "metric_group": "cpu", "name": "usage_user", "tag_names": [], "tag_values": []}, {"function": "median", "metric_group": "cpu", "name": "usage_user", "tag_names": [], "tag_values": []}, {"function": "mode", "metric_group": "cpu", "name": "usage_user", "tag_names": [], "tag_values": []}], "rows": [[1616592330000000000, 1616592301000000000, 1616592270000000000, 1616592239000000000, 1616592210000000000, 1616592180000000000, 1616592151000000000, 1616592119000000000, 1616592088000000000, 1616592061000000000, 1616592028000000000, 1616591998000000000, 1616591971000000000, 1616591941000000000, 1616591909000000000, 1616591881000000000, 1616591851000000000, 1616591820000000000, 1616591791000000000, 1616591759000000000, 1616591730000000000, 1616591701000000000, 1616591670000000000, 1616591640000000000, 1616591610000000000, 1616591580000000000, 1616591549000000000, 1616591518000000000, 1616591488000000000, 1616591459000000000], [0.7852958732667528, 0.8717941598906108, 0.8046686654440718, 0.9705899199824792, 0.8634602215503702, 0.8714146259884148, 0.8979304733975735, 0.9865561529703868, 0.9279498421250738, 0.9414714738421324, 0.9090326829302711, 0.5545243842333544, 0.8358426635178857, 0.8870912940900901, 0.8289124389963101, 0.9805357173355702, 0.8671698651175905, 0.9657195362375817, 0.9047871878770615, 0.9699605599273659, 0.869886162004556, 0.857434973245055, 0.864846380935214, 0.9895599224279195, 0.5743281671868437, 0.8676925244608373, 0.9034956610765974, 0.9419259299791456, 0.8332354553783257, 0.861280967420843], [0.7526513855627853, 0.8630079597820883, 0.7545931758530888, 0.9576395479250972, 0.8977900552485016, 0.8660659609833167, 0.883559482486629, 1.0918432883752391, 0.9208445725978266, 0.9450633883981642, 0.9120851279451705, 0.5554038058818209, 0.7392473118279026, 0.8882544214449253, 0.8280651767430236, 0.9743285605354475, 0.7667731629392549, 0.9239516702203138, 0.7645747053200297, 0.976917091726474, 0.8634832915982165, 0.8624938393297477, 0.862354892205661, 0.9902666102413291, 0.5285761480013661, 0.8678724957418328, 0.8505070330389054, 0.9434756970769788, 0.8343368312402867, 0.8551266085512552], [0.5135227661760019, 0.5984042553190424, 0.4452926208650636, 0.6851661527920438, 0.5351170568562149, 0.416666666666693, 0.6835937499999075, 0.578406169665783, 0.7757665312153003, 0.6099420555046762, 0.4153686396677292, 0.4096834264432205, 0.5890505890506081, 0.40957781978577124, 0.35398230088503624, 0.8739495798317953, 0.5936675461741707, 0.8278716798897067, 0.6901084456129015, 0.480934386808698, 0.6177076183938984, 0.42372881355925296, 0.7299270072992804, 0.3699966363941703, 0.1982160555005002, 0.35495321071315894, 0.6070826306913929, 0.40174087713432627, 0.44353462981929104, 0.593276203032249]]}}}`;

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    // const {range} = options;
    // const from = range!.from.valueOf();
    // const to = range!.to.valueOf();
    var ob = JSON.parse(json);
    // Return a constant for each query.
    const data = options.targets.map(target => {
      const query = defaults(target, defaultQuery);
      // const duration = to - from;
      // const step = duration / 1000;
      var rows = _.get(ob, 'response.data.rows', []);
      var fields: any[] = [];
      _.get(ob, 'response.data.columns', []).forEach(function(dc: any, i: number) {
        if (dc.name === 'timestamp') {
          rows[i] = rows[i].map((x: number) => x / 1000000);
        }
        console.log(dc);
        fields.push({
          name: dc.name + dc.function,
          type: dc.name === 'timestamp' ? FieldType.time : FieldType.number,
          values: rows[i],
        });
      });
      const df = toDataFrame({
        name: 'whatever_the_fuck',
        fields: fields,
      });
      const frame = new MutableDataFrame(df);
      frame.refId = query.refId;
      console.log(frame);
      console.log(rows);
      return frame;
    });

    return { data };
  }

  async testDatasource() {
    // Implement a health check for your data source.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
