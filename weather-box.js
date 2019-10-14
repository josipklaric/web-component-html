import { apiKey } from "./key.js";

class WeatherBox extends HTMLElement {

    constructor() {
        console.log("constructor entered...");
        super();

        this.attachShadow({mode: 'open'});

        const templateContent = this.getTemplate();
        this.shadowRoot.innerHTML = templateContent;
        this.intervalValue = 0;
    }

    connectedCallback() {
        console.log("connectedCallback entered...");

        this.render();

        if(this.interval) {
            this.intervalValue = setInterval(() => {
                this.render();
            }, parseInt(this.interval) * 60 * 1000);
        }
    }
    
    disconnectedCallback() {
        console.log("disconnectedCallback entered...");

    }

    attributeChangedCallback(attributeName, oldValue, newValue) {
        console.log(`attributeChangedCallback entered... attributeName: ${attributeName}, oldValue: ${oldValue}, newValue: ${newValue}`);

        if (attributeName == 'city') {
            if(oldValue) {
                this.render();
            }
        }
        else if(attributeName == 'interval') {
            console.log('attributeChanged -> interval');
            if(oldValue && newValue != oldValue) {

                clearInterval(this.intervalValue);
                
                let newIntervalValue = parseInt(newValue) * 60 * 1000;
                
                this.intervalValue = setInterval(() => {
                    this.render();
                }, newIntervalValue);
            }
        }
        else if(attributeName == 'background') {
            console.log('attributeChanged -> background');
            if(oldValue && newValue != oldValue) {
                this.shadowRoot.querySelector('.container').style.background = newValue;
            }
        }
    }

    render() {
        console.log("render entered...");

        this.shadowRoot.querySelector('#city').textContent = this.city;

        let url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${this.city}`; //&lang=en`;

        fetch(url)
            .then((result) => { 
                return result.json()
            })
            .then((result) => {

                this.shadowRoot.querySelector('#city').textContent = result.location.name;
                this.shadowRoot.querySelector('#location').textContent = `${result.location.region}, ${result.location.country}`;
                this.shadowRoot.querySelector('.container').style.background = this.background;
                this.shadowRoot.querySelector('#temp').textContent = `${result.current.temperature}°`;
                this.shadowRoot.querySelector('#code').className = "icon-" + result.current.weather_code + (result.current.is_day === "no" ? "n" : "d");
                this.shadowRoot.querySelector('#description').textContent = result.current.weather_descriptions;
                this.shadowRoot.querySelector('#wind').textContent = `${result.current.wind_speed} km/h`;
                //console.log("icon name: " + "icon-" + result.current.weather_code + (result.current.is_day === "no" ? "n" : "d"));
                this.dispatchEvent(new CustomEvent('contentChanged', {
                    detail: {
                        temperature: `${result.current.temperature}°C`,
                        description: result.current.weather_descriptions
                    }
                }))
            })
            .catch(function(err) {  
                console.log('fetch error: ', err);  
            })
    }

    static get observedAttributes() {
        return ['city', 'background', 'interval'];
    }

    get city() {
        return this.getAttribute('city');
    }

    set city(cityName) {
        this.setAttribute('city', cityName);
    }

    get background() {
        return this.getAttribute('background');
    }

    set background(bgColor) {
        this.setAttribute('background', bgColor);
    }

    get interval() {
        return this.getAttribute('interval');
    }

    set interval(minutes) {
        this.setAttribute('interval', minutes);
    }

    getTemplate() {
        return this.getStyles() + '\n ' +  this.getHtml();
    }

    getHtml() {
        return `
        <div class="container">
            <h2 id="city">City</h2>
            <h6 id="location"></h6>
            <dl>
                <dt><i id="code"></i></dt>
                <dt><span id="temp"></span><span class="unit">C</span></dt>
            </dl>
            <ul>
                <li id="description" class="description">Clear</li>
                <li id="wind">0</li>
            </ul>
        </div>
        `;
    }

    getStyles() {
        return `
        <style>
            :host {
                display: block;
                color: rgb(105, 105, 105);
                width: 450px;
                height: 450px;
                margin: 0 auto;
            }
            i {
                color: #fff;
                font-family: MeteoconsRegular;
                font-size: 1em;
                font-weight: normal;
                font-style: normal;
                text-transform: none;
            }
            h1 {
                margin: 0 0 8px;
                color: #fff;
                font-size: 100px;
                font-weight: 300;
                text-align: center;
                text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
            }
            h2 {
                margin: 10px 0;
                color: #fff;
                font-size: 64px;
                font-weight: 100;
                text-align: center;
                text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
            }
            h6 {
                margin: 2px;
                text-align: center;
                color: #fff;
            }
            ul {
                margin: 0;
                padding: 0 0 10px 0;
                text-align: center;
            }
            li {
                background: rgb(220, 220, 220);
                background: rgba(220, 220, 220, 0.9);
                padding: 10px;
                display: inline-block;
                border-radius: 5px;
            }
            .description {
                margin: 0 10px;
            }
            dl {
                width: 100%;
                overflow: hidden;
                padding: 0;
                margin: 0;
                text-align: center;
            }
            dt {
                padding: 5px;
                display: inline-block;
                color: #fff;
                font-size: 120px;
                text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
                font-weight: lighter;
                vertical-align: top;
            }
            .unit {
                font-size: .5em;
                line-height: 1em;
            }
            .icon-1000d:before { content: "B"; }
            .icon-1000n:before { content: "C"; }
            .icon-1003d:before { content: "H"; }
            .icon-1003n:before { content: "I"; }
            .icon-1006d:before { content: "N"; }
            .icon-1006n:before { content: "N"; }
            .icon-1009d:before { content: "Y"; }
            .icon-1009n:before { content: "Y"; }
            .icon-1030d:before { content: "M"; }
            .icon-1030n:before { content: "M"; }
            .icon-1063d:before { content: "Q"; }
            .icon-1063n:before { content: "7"; }
            .icon-1066d:before { content: "U"; }
            .icon-1066n:before { content: '"'; }
            .icon-1069d:before { content: "X"; }
            .icon-1069n:before { content: "$"; }
            .icon-1072d:before { content: "X"; }
            .icon-1072n:before { content: "$"; }
            .icon-1087d:before { content: "O"; }
            .icon-1087n:before { content: "6"; }
            .icon-1114d:before { content: "W"; }
            .icon-1114n:before { content: "#"; }
            .icon-1117d:before { content: "W"; }
            .icon-1117n:before { content: "#"; }
            .icon-1135d:before { content: "J"; }
            .icon-1135n:before { content: "K"; }
            .icon-1147d:before { content: "L"; }
            .icon-1147n:before { content: "9"; }
            .icon-1150d:before { content: "Q"; }
            .icon-1150n:before { content: "7"; }
            .icon-1153d:before { content: "Q"; }
            .icon-1153n:before { content: "7"; }
            .icon-1168d:before { content: "Q"; }
            .icon-1168n:before { content: "7"; }
            .icon-1171d:before { content: "R"; }
            .icon-1171n:before { content: "8"; }
            .icon-1180d:before { content: "Q"; }
            .icon-1180n:before { content: "7"; }
            .icon-1183d:before { content: "Q"; }
            .icon-1183n:before { content: "7"; }
            .icon-1186d:before { content: "Q"; }
            .icon-1186n:before { content: "7"; }
            .icon-1189d:before { content: "Q"; }
            .icon-1189n:before { content: "7"; }
            .icon-1192d:before { content: "R"; }
            .icon-1192n:before { content: "8"; }
            .icon-1195d:before { content: "R"; }
            .icon-1195n:before { content: "8"; }
            .icon-1198d:before { content: "Q"; }
            .icon-1198n:before { content: "7"; }
            .icon-1201d:before { content: "R"; }
            .icon-1201n:before { content: "8"; }
            .icon-1204d:before { content: "X"; }
            .icon-1204n:before { content: "$"; }
            .icon-1207d:before { content: "X"; }
            .icon-1207n:before { content: "$"; }
            .icon-1210d:before { content: "U"; }
            .icon-1210n:before { content: '"'; }
            .icon-1213d:before { content: "U"; }
            .icon-1213n:before { content: '"'; }
            .icon-1216d:before { content: "U"; }
            .icon-1216n:before { content: '"'; }
            .icon-1219d:before { content: "U"; }
            .icon-1219n:before { content: '"'; }
            .icon-1222d:before { content: "W"; }
            .icon-1222n:before { content: "#"; }
            .icon-1225d:before { content: "W"; }
            .icon-1225n:before { content: "#"; }
            .icon-1237d:before { content: "W"; }
            .icon-1237n:before { content: "#"; }
            .icon-1240d:before { content: "Q"; }
            .icon-1240n:before { content: "7"; }
            .icon-1243d:before { content: "R"; }
            .icon-1243n:before { content: "8"; }
            .icon-1246d:before { content: "R"; }
            .icon-1246n:before { content: "8"; }
            .icon-1249d:before { content: "Q"; }
            .icon-1249n:before { content: "7"; }
            .icon-1252d:before { content: "R"; }
            .icon-1252n:before { content: "8"; }
            .icon-1255d:before { content: "U"; }
            .icon-1255n:before { content: '"'; }
            .icon-1258d:before { content: "W"; }
            .icon-1258n:before { content: "#"; }
            .icon-1261d:before { content: "U"; }
            .icon-1261n:before { content: '"'; }
            .icon-1264d:before { content: "W"; }
            .icon-1264n:before { content: "#"; }
            .icon-1273d:before { content: "Q"; }
            .icon-1273n:before { content: "7"; }
            .icon-1276d:before { content: "R"; }
            .icon-1276n:before { content: "8"; }
            .icon-1279d:before { content: "O"; }
            .icon-1279n:before { content: '"'; }
            .icon-1282d:before { content: "W"; }
            .icon-1282n:before { content: "#"; }
        </style>
        `;
    }
}

// register custom element
window.customElements.define("weather-box", WeatherBox);


