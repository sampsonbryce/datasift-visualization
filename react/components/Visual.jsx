import React from 'react'
import credentials from '../../credentials.js'

var Visual = React.createClass({
    getInitialState() {
        let state = {
            data: ''
        }
        return state;
    },
    loadData() {
        let search_object = {
            id: credentials.entertainmentId,
            filter: 'fb.author.country_code in "US" and fb.all.content contains "Star Wars"',
            parameters: {
                "analysis_type": "freqDist",
                "parameters": {
                    "target": "fb.author.region",
                    "threshold": 50
                },
                "child": {
                    analysis_type: 'freqDist',
                    parameters: {
                        target: 'fb.author.gender',
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
                Authorization: credentials.username + ':' + credentials.apiKey,
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
            cur_state.data = response.analysis;
            this.setState(this.state);
        })
    },
    render() {
        return (
            <div>
                <button onClick={this.loadData}>Load Data</button>
                <p>
                    {JSON.stringify(this.state.data)}
                </p>
            </div>
        )
    }
});

export default Visual;
