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
                }
            },
            currently_selected_object: 'World'
        }
        return state;
    },
    loadData() {
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
        console.log(search_object);

        $.ajax({
            url: 'https://pylonsandbox.datasift.com/v1.3/pylon/analyze',
            data: search_object,
            contentType: 'application/json',
            method: 'POST',
            headers: {
                Authorization: credentials.username + ':' + credentials.apiKey
            },
            success: function(data, status, request) {
                console.log('success');
            },
            error: function(request, status, error) {
                console.log('error', status, error);
            }
        }).then((response) => {
            console.log('response', response);
            let cur_state = this.state;
            cur_state.data = response;
            this.setState(this.state);
            this.graph();
        })
    },
    graph() {

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
            console.log('data', state, total_interactions);
            var percent = 0;
            if (state.length !== 0) {
                //we have data for this state
                state = state[0]

                // show which states we have data for and which we dont
                percent = 1;

                //percent of interactions per state
                // percent = (state.interactions / total_interactions) * 10;

                //determining negative or positive for each state
                // if (state.child.results.length !== 0){
                //   percent = this.calculateSentiment(state, total_interactions);
                // }
            } else {
                states_without_data.push(d);
            }
            if (percent > 0) {
                var i = d3.interpolate("#B3B3B3", "#00AD42")
            } else {
                var i = d3.interpolate("#B3B3B3", "#F50723")
                percent = Math.abs(percent)
            }
            // d3.interpolate("#ffffcc", "#800026")

            console.log('percent of available state', percent);
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
        console.log('state.child.results', state.child.results);
        var neg_interactions = $.grep(state.child.results, (e) => {
            return e.key == 'negative';
        });
        var pos_interactions = $.grep(state.child.results, (e) => {
            return e.key == 'positive';
        });
        console.log('pos, neg', pos_interactions, neg_interactions);
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
    },
    componentDidMount() {
        // $('.dropdown-toggle').dropdown();
    },
    render() {
        this.loadData();
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
                </div>
                <div className='row'>
                    <p>
                        <svg width="960" height="600" id="statesvg"></svg>
                    </p>
                    <div>
                        <h4>States Without Data</h4>
                        <ul>
                            {this.state.states_without_data.map((element, index) => {
                                console.log('index, element', index, element);
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
