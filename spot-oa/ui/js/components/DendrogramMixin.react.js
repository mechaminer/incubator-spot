var $ = require('jquery');
const Base64 = require('js-base64').Base64;
var d3 = require('d3');
var React = require('react');
const SpotUtils = require('../utils/SpotUtils');

var DendrogramMixin = {
  buildChart ()
  {
    const svgSel = $(this.svg);

    this.canvasWidth = $(this.getDOMNode()).width();
    this.canvasHeight = 100 + this.state.leafNodes * 20; // Make sure last magic number is at least twice the font size

    svgSel.width(this.canvasWidth).height(this.canvasHeight);

    this.cluster = d3.layout.cluster();

    this.diagonal = d3.svg.diagonal()
                                .projection(function (d) {
                                    return [d.y, d.x]
                                });

    this.canvas = d3.select(this.svg).append('g')
                                        .attr('transform', 'translate(100,50)');
  },
  draw() {
      this.cluster.size([this.canvasHeight-100, this.canvasWidth-300]);

      const nodes = this.cluster.nodes(this.state.data);
      const links = this.cluster.links(nodes);

      this.drawNodes(nodes);
      this.drawLinks(links);
  },
  drawNodes(nodes) {
      const nodeSel = {};

      nodeSel.update = this.canvas.selectAll('.node').data(nodes, n => n.id);

      nodeSel.enter = nodeSel.update.enter();
      nodeSel.exit = nodeSel.update.exit();

      const nodeEl = nodeSel.enter.append('g')
                                .attr('class', n => `node depth_${n.depth}`)
                                .attr('transform', n => `translate(${n.y},${n.x})`);

      nodeEl.append('circle')
                        .attr('r', 4.5)
                        .attr('id', n => SpotUtils.encodeId(n.id))
                        .on('mouseover', function (n) {
                          d3.select(this)
                                        .style('cursor', 'pointer')
                                        .style('fill', '#C4D600');
                        })
                        .on('mouseout', function (d)
                        {
                          d3.select(this)
                                        .style('cursor', null)
                                        .style('fill', null);
                        });

      nodeEl.append('text')
                      .attr('dx', n => n.depth===0 ? -10 : 10)
                      .attr('dy', 3)
                      .style('text-anchor', n => n.depth===0 ? 'end' : 'start')
                      .attr('fill', 'black')
                      .text(n => n.name);

    nodeSel.exit.remove();
  },
  drawLinks(links) {
      const linkSel = {};

      linkSel.update = this.canvas.selectAll('.link')
                                  .data(links, l => `link-${l.source.id}-${l.target.id}`);
      linkSel.enter = linkSel.update.enter();
      linkSel.exit = linkSel.update.exit();

      linkSel.enter.append('path', '.node')
        .attr('class', 'link')
        .attr('d', this.diagonal)
        .on('mouseover', function (l)
        {
            d3.select(this)
                .style('stroke-width', 2)
                .style('cursor', 'pointer')
                .style('stroke', '#ED1C24');

            d3.selectAll(`#${SpotUtils.encodeId(l.source.id)},#${SpotUtils.encodeId(l.target.id)}`)
                .style('fill', '#C4D600');
      })
      .on('mouseout', function (l)
      {
        d3.select(this)
                      .style('stroke-width', null)
                      .style('cursor', null)
                      .style('stroke', null);

        d3.selectAll(`#${SpotUtils.encodeId(l.source.id)},#${SpotUtils.encodeId(l.target.id)}`)
                        .style('fill', null);
      });

    // Remove old nodes
    linkSel.exit.remove();
  }
};

module.exports = DendrogramMixin;
