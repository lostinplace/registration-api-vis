import $ from 'jquery';
import _ from 'lodash';
import d3 from 'd3';
import {buildFunnel} from 'js/funnel-sankey'

export function bootstrap() {
  buildFunnel();
}

bootstrap();
