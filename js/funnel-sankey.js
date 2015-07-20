import rawData from 'data.json!';
import d3 from 'd3';
import sankey from 'js/sankey';
import _ from 'lodash';

export function buildFunnel() {
  var nodeNames = [
    'Session Created',
    'Session Abandoned',
    'Driver Created',
    'License Submitted',
    'Rates Shown',
    'Application Created',
    'License Approved',
    'License Rejected',
    'Account Created'
  ]

  var sessionToAbandoned = {
    origin: 'Session Created',
    destination: 'Session Abandoned',
    evaluator: function(record){
      return !(record['drivers-update'] || record['drivers-create'] || record['rates-show']);
    }
  }

  var sessionToDriverCreated = {
    origin: 'Session Created',
    destination: 'Driver Created',
    evaluator: function(record){
      return (record['drivers-update'] || record['drivers-create']);
    }
  }

  var driverCreatedThenAbandoned = {
    origin: 'Driver Created',
    destination: 'Session Abandoned',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var abandoned = created && !record['license_verification-create'];
      return abandoned;
    }
  }

  var driverCreatedThenLicenseSubmitted = {
    origin: 'Driver Created',
    destination: 'License Submitted',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var abandoned = created && record['license_verification-create'];
      return abandoned;
    }
  }

  var licenseSubmittedAndRejected = {
    origin: 'License Submitted',
    destination: 'License Rejected',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];
      var rejected = submitted && record['rejectReason'];
      return rejected;
    }
  }

  var licenseSubmittedAndApproved = {
    origin: 'License Submitted',
    destination: 'License Approved',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];
      var approved = submitted && !record['rejectReason'];
      return approved;
    }
  }

  var licenseRejectedAndAbandoned = {
    origin: 'License Rejected',
    destination: 'Session Abandoned',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];
      var rejected = submitted && record['rejectReason'];
      var abandoned = rejected && !record['accounts-create'];
      return abandoned;
    }
  }

  var licenseRejectedAndAccountCreated = {
    origin: 'License Rejected',
    destination: 'Account Created',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];
      var rejected = submitted && record['rejectReason'];
      var created = rejected && record['accounts-create'];
      return created;
    }
  }

  var licenseApprovedAndAccountCreated = {
    origin: 'License Approved',
    destination: 'Account Created',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];
      var approved = submitted && !record['rejectReason'];
      var account = approved && record['accounts-create'];
      return account;
    }
  }

  var licenseApprovedAndSessionAbandoned = {
    origin: 'License Approved',
    destination: 'Session Abandoned',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];
      var approved = submitted && !record['rejectReason'];
      var noAccount = approved && !record['accounts-create'];
      return noAccount;
    }
  }

  var accountCreatedAndRatesShown = {
    origin: 'Account Created',
    destination: 'Rates Shown',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];

      var approved = submitted && !record['rejectReason'];

      var rejected = submitted && record['rejectReason'];

      var created = (approved || rejected) && record['accounts-create'];

      var shown = created && record['rates-show'];
      return shown;
    }
  }

  var accountCreatedAndSessionAbandoned = {
    origin: 'Account Created',
    destination: 'Session Abandoned',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];

      var approved = submitted && !record['rejectReason'];

      var rejected = submitted && record['rejectReason'];

      var created = (approved || rejected) && record['accounts-create'];

      var abandoned = created && !record['rates-show'];
      return abandoned;
    }
  }

  var ratesShownAndApplicationCreated = {
    origin: 'Rates Shown',
    destination: 'Application Created',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];

      var approved = submitted && !record['rejectReason'];

      var rejected = submitted && record['rejectReason'];

      var created = (approved || rejected) && record['accounts-create'];

      var shown = created && record['rates-show'];
      var application = shown && record['sessions-application'];
      return application;
    }
  }

  var sessionCreatedAndRatesShown = {
    origin: 'Session Created',
    destination: 'Rates Shown',
    evaluator: function(record) {
      var ratesShown = record['rates-show']
      var anythingElse = (record['drivers-update'] || record['drivers-create'] || record['license_verification-create']);
      anythingElse = anythingElse || (record['accounts-create'] || record['sessions-application']);
      return ratesShown && !anythingElse;
    }
  }

  var ratesShownAndSessionAbandoned = {
    origin: 'Rates Shown',
    destination: 'Session Abandoned',
    evaluator: function(record){
      var created = (record['drivers-update'] || record['drivers-create']);
      var submitted = created && record['license_verification-create'];

      var approved = submitted && !record['rejectReason'];

      var rejected = submitted && record['rejectReason'];

      var created = (approved || rejected) && record['accounts-create'];

      var shown = created && record['rates-show'];
      var abandoned = shown && !record['sessions-application'];
      return abandoned || sessionCreatedAndRatesShown.evaluator(record);
    }
  }

  var nodeProfiles = [
    sessionToAbandoned,
    sessionToDriverCreated,
    driverCreatedThenAbandoned,
    driverCreatedThenLicenseSubmitted,
    licenseSubmittedAndRejected,
    licenseSubmittedAndApproved,
    licenseRejectedAndAbandoned,
    licenseRejectedAndAccountCreated,
    licenseApprovedAndAccountCreated,
    accountCreatedAndRatesShown,
    ratesShownAndApplicationCreated,
    ratesShownAndSessionAbandoned,
    licenseApprovedAndSessionAbandoned,
    accountCreatedAndSessionAbandoned
    ,sessionCreatedAndRatesShown

  ];

  //{"source":0,"target":1,"value":124.729},

  var links = [];

  nodeProfiles.forEach(function(profile){
    var link = {};
    link.source = nodeNames.indexOf(profile.origin);
    link.target = nodeNames.indexOf(profile.destination);
    var records = _.filter(_.values(rawData), profile.evaluator);
    link.value = records.length;
    links.push(link);
  });

  var nodes = _.map(nodeNames, function(value){
    return {name:value};
  });

  var data = {
    nodes: nodes,
    links: links
  };

  var margin = {top: 1, right: 150, bottom: 200, left: 1},
    width = 1024 - margin.left - margin.right,
    height = 768 - margin.top - margin.bottom;

  var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " sessions"; },
    color = d3.scale.category20();

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([width, height]);

  var path = sankey.link();

  sankey
    .nodes(data.nodes)
    .links(data.links)
    .layout(32);

  var link = svg.append("g").selectAll(".link")
    .data(data.links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", path)
    .style("stroke-width", function(d) { return Math.max(1, d.dy); })
    .sort(function(a, b) { return b.dy - a.dy; });

  link.append("title")
    .text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  var node = svg.append("g").selectAll(".node")
    .data(data.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", function() { this.parentNode.appendChild(this); })
    .on("drag", dragmove));

  node.append("rect")
    .attr("height", function(d) { return d.dy; })
    .attr("width", sankey.nodeWidth())
    .style("fill", function(d) { return d.color = color(d.name.replace(/ .*/, "")); })
    .style("stroke", function(d) { return d3.rgb(d.color).darker(2); })
    .append("title")
    .text(function(d) { return d.name + "\n" + format(d.value); });

  node.append("text")
    // .attr("x", -6)
    .attr("y", function(d) { return d.dy / 3; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function(d) { return d.name; })
    // .filter(function(d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

  function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
}
