import React from 'react';
import credentials from '../../credentials.js';
import {uStates, uStatesPaths} from '../../public/javascripts/uStates.js';
import {DropdownButton, MenuItem} from 'react-bootstrap';

var Visual = React.createClass({
    getInitialState() {
        let state = {
            data: '',
            states_without_data: [],
            data_select_object: {
                'World': {
                    filter: 'fb.author.country_code in "US"',
                    title: 'Sentinment of the World according to Facebook interactions'
                },
                'Suicide Squad': {
                    filter: 'fb.author.country_code in "US" and fb.all.content contains "Suicide Squad"',
                    title: 'Sentinment towards Suicide Squad according to Facebook interactions'
                },
                'Star Wars': {
                    filter: 'fb.author.country_code in "US" and fb.all.content contains "Star Wars"',
                    title: 'Sentinment towards Star Wars according to Facebook interactions'
                },
                'Olympics': {
                    filter: 'fb.author.country_code in "US" and fb.all.content contains_any "Olympics, olympics"',
                    title: 'Sentinment towards the Olympics according to Facebook interactions'
                }
            },
            data_filter_object: {
              'Available States': (state, total_interactions) => {return 1},
              'Interaction Per State': (state, total_interactions) => {return (state.interactions / total_interactions) * 10},
              'Sentiment Per State': (state, total_interactions) => {
                if (state.child.results.length !== 0){
                   return this.calculateSentiment(state, total_interactions);
                }
                return 0;
              }
            },
            currently_selected_filter: 'Available States',
            currently_selected_object: 'World'
        }
        return state;
    },
    loadData() {
        // $('#statesvg').remove();
        // d3.select("#statesvg").remove();
        $('#without-data').css('display', 'none');
        $('#data-row').prepend(
          '<div class="loader"></div>'
        );
        let search_object = {
            id: credentials.entertainmentId,
            filter: this.curObject().filter,
            parameters: {
                "analysis_type": "freqDist",
                "parameters": {
                    "target": "fb.author.region",
                    "threshold": 50
                },
                "child": {
                    analysis_type: 'freqDist',
                    parameters: {
                        target: 'fb.parent.sentiment',
                        threshold: 2
                    }
                }
            }
        }
        search_object = JSON.stringify(search_object);

        $.ajax({
            url: 'https://pylonsandbox.datasift.com/v1.3/pylon/analyze',
            data: search_object,
            contentType: 'application/json',
            method: 'POST',
            headers: {
                Authorization: credentials.username + ':' + credentials.apiKey
            },
            success: function(data, status, request) {
                // console.log('success');
            },
            error: function(request, status, error) {
                console.log('error', status, error);
            }
        }).then((response) => {
            let cur_state = this.state;
            cur_state.data = response;
            this.setState(this.state);
            $('#without-data').css('display', 'inline-block');
            this.graph();
        })
    },
    graph() {
        $('.loader').remove();
        // console.log('changin to inline')
        // $('#data-row p').append(
        //   '<svg width="960" height="600" id="statesvg"></svg>'
        // )
        console.log('graphing')
        var states_without_data = []
        var sampleData = {};/* Sample random data. */
        [
            "HI",
            "AK",
            "FL",
            "SC",
            "GA",
            "AL",
            "NC",
            "TN",
            "RI",
            "CT",
            "MA",
            "ME",
            "NH",
            "VT",
            "NY",
            "NJ",
            "PA",
            "DE",
            "MD",
            "WV",
            "KY",
            "OH",
            "MI",
            "WY",
            "MT",
            "ID",
            "WA",
            "DC",
            "TX",
            "CA",
            "AZ",
            "NV",
            "UT",
            "CO",
            "NM",
            "OR",
            "ND",
            "SD",
            "NE",
            "IA",
            "MS",
            "IN",
            "IL",
            "MN",
            "WI",
            "MO",
            "AR",
            "OK",
            "KS",
            "LS",
            "VA"
        ].forEach(function(d) {
            this.createRealNameObject();
            var total_interactions = this.state.data.interactions;
            var state = $.grep(this.state.data.analysis.results, (e) => {
                return this.real_object[e.key] == d;
            });
            var percent = 0;
            if (state.length !== 0) {
                //we have data for this state
                state = state[0]
                percent = this.state.data_filter_object[this.state.currently_selected_filter](state, total_interactions);
            } else {
                states_without_data.push(d);
            }
            if (percent > 0) {
                var i = d3.interpolate("#B3B3B3", "#00AD42")
            } else {
                var i = d3.interpolate("#B3B3B3", "#F50723")
                percent = Math.abs(percent)
            }
            sampleData[d] = {
                color: i(percent)
            };
        }, this);
        var cur_state = this.state;
        cur_state.states_without_data = states_without_data;
        this.setState(cur_state);
        /* draw states on id #statesvg */
        uStates.draw("#statesvg", sampleData, this.tooltipHtml);

        d3.select(self.frameElement).style("height", "600px");
    },
    calculateSentiment(state, total_interactions) {
        var neg_interactions = $.grep(state.child.results, (e) => {
            return e.key == 'negative';
        });
        var pos_interactions = $.grep(state.child.results, (e) => {
            return e.key == 'positive';
        });
        if (pos_interactions.length !== 0 && neg_interactions.length !== 0) {
            var total_happiness = pos_interactions[0].interactions - neg_interactions[0].interactions;
        } else if (pos_interactions.length === 0 && neg_interactions.length !== 0) {
            total_happiness = -neg_interactions[0].interactions;
        } else if (pos_interactions.length !== 0 && neg_interactions.length === 0) {
            total_happiness = pos_interactions[0].interactions;
        }

        if (pos_interactions.length !== 0 || neg_interactions.length !== 0) {
            var percent = (total_happiness / total_interactions) * 100;
        }

        return percent;
    },
    createRealNameObject() {
        this.real_object = {}
        uStatesPaths.forEach((obj) => {
            this.real_object[obj.n] = obj.id;
        })
    },
    tooltipHtml(n, d) {/* function to create html content string in tooltip div. */
        return "<h3>Tooltip</h3>";
    },
    curObject() {
        return this.state.data_select_object[this.state.currently_selected_object];
    },
    changeData(item) {
        var state = this.state;
        state.currently_selected_object = item;
        this.setState(state);
        this.loadData();
    },
    changeFilter(item){
        var state = this.state;
        state.currently_selected_filter = item;
        this.setState(state);
        this.graph();
    },
    componentDidMount() {
        this.loadData();
    },
    render() {
        return (
            <div id='map-container' className='container'>
                <h1>{this.curObject().title}</h1>
                <div className='row'>
                    <DropdownButton id='data-dropdown' title={this.state.currently_selected_object}>
                        {Object.keys(this.state.data_select_object).map((item, index) => {
                            return (
                                <MenuItem key={index} title={item} onSelect={this.changeData.bind(this, item)}>{item}</MenuItem>
                            )
                        })}
                    </DropdownButton>
                    <DropdownButton id='data-dropdown' title={this.state.currently_selected_filter}>
                        {Object.keys(this.state.data_filter_object).map((item, index) => {
                            return (
                                <MenuItem key={index} title={item} onSelect={this.changeFilter.bind(this, item)}>{item}</MenuItem>
                            )
                        })}
                    </DropdownButton>
                </div>
                <div className='row' id='data-row'>
                    <p>
                        <svg width="960" height="600" id="statesvg"></svg>
                    </p>
                    <div id='without-data'>
                        <h4>States Without Data</h4>
                        <ul>
                            {this.state.states_without_data.map((element, index) => {
                                return (
                                    <li key={index}>{element}</li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
});

export default Visual;
