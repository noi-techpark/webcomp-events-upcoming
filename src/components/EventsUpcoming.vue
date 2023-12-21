<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <body
    v-bind:style="{ 'font-family': this.options.fontName + ', sans-serif' }"
  >
    <header>
      <h1 class="title"><strong>EVENTS</strong></h1>
      <!-- <img
        :src="require('@/assets/icons/NOI_2_BK_borderless.png')"
        class="noi-logo"
      />  -->
      <div id="current-date-time">
        <span id="date">{{ currentDate() }}</span>
        <span id="time">{{ timestamp }}</span>
      </div>
    </header>
    <div
      class="slideshow-container full-height"
      v-bind:style="{ 'background-color': this.options.backgroundColor }"
    >
      <div class="content container-fluid">
        <div class="lines">
          <div class="row line" v-for="event in events" :key="event.key">
            <div class="col-xs-12 col-sm-7 col-lg-7 col-md-7 description">
              <h2 v-if="event.webAddress != null && event.webAddress != ''">
                <a :href="event.webAddress" target="_blank">
                  <strong> {{ event.shortName }} </strong>
                </a>
                <br />
                <small> {{ event.dateperiod }} </small>
              </h2>
              <h2 v-else>
                <strong> {{ event.shortName }} </strong>
                <br />
                <small> {{ event.dateperiod }} </small>
              </h2>
            </div>
            <div
              class="col-sm-5 col-xs-12 col-lg-5 col-lg-offset-0 col-md-5"
              style="justify-content: flex-end"
            >
              <div
                class="location"
                :style="'background-color:' + backgroundcolor"
              >
                <span class="room">
                  <strong>
                    {{ event.eventLocation }}
                    <br />
                  </strong>
                  <!-- <small>
                    {{ event.time }}
                  </small> -->
                </span>
              </div>
              <div class="starts-in">
                <div>
                  <strong>
                    {{ formatDate(event.nextBeginDate) }}
                    <br />
                  </strong>
                  <small> {{ event.nextBeginTime }} </small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <a href="https://opendatahub.com" target="_blank" class="footer-text"
            >powered by Open Data Hub
            <img
              :src="require('@/assets/icons/NOI_OPENDATAHUB_NEW_WH-01.png')"
              height="35px"
          /></a>
        </div>
      </div>
    </div>
  </body>
</template>

<script>
import moment from "moment";
import _ from "lodash";

export default {
  name: "EventsUpcoming",
  props: {
    options: Object,
    default: () => {
      return {};
    },
  },
  data: function () {
    return {
      events: [],
      timestamp: "",
      languages: ["en", "de", "it"],
      currentlanguage: "",
      backgroundcolor: "",
    };
  },
  computed: {
    orderedEvents: function () {
      return _.orderBy(this.events, "nextBeginDate");
    },
  },
  created: function () {
    this.currentlanguage = this.options.language;
    this.getNow();
    this.backgroundcolor = this.options.backgroundColor;

    //If no language is set use the rotation
    if (this.options.language == "") {
      this.currentlanguage = "en";
      setInterval(
        this.rotateLanguage,
        this.options.languageRotationInterval * 1000
      );
    }
    this.rotateEvents();
    // create cron job
    setInterval(this.getNow, 1000);
    setInterval(this.rotateEvents, this.options.eventRotationInterval * 1000);
  },
  methods: {
    async fetchData() {
      this.events = [];
      const baseURL = "https://api.tourism.testingmachine.eu/v1/Event?";
      //const baseURL = "https://tourism.api.opendatahub.com/v1/Event?";
      const params = new URLSearchParams([
        ["begindate", new Date().toISOString()],
        ["locfilter", this.options.locationFilter],
        ["source", this.options.source],
        ["language", this.currentlanguage],
        ["langfilter", this.currentlanguage],
        ["pagesize", this.options.maxEvents ? this.options.maxEvents : 999],
        ["active", true],
        ["sort", this.options.eventSortmode],
        ["origin", "webcomp-events-upcoming"],
      ]);
      fetch(baseURL + params, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        response.json().then((json) => {
          var items = json.Items;
          for (var i = 0; i <= items.length - 1; ++i) {
            let element = items[i];
            //TODO use EventDAte "EventDate": [{"To": "2023-12-08T00:00:00","End": "22:00:00","From": "2023-12-08T00:00:00","Begin": "10:00:00" nearest
            let startDate = new Date(element.DateBegin);
            let endDate = new Date(element.DateEnd);
            let nextbegin = this.getNextBeginDate(element.EventDate);
            let event = {
              shortName:
                element.Detail[this.currentlanguage].Title ?? "no title",
              eventLocation: this.getLocationToShow(
                element,
                this.options.locationToShow,
                this.currentlanguage
              ),
              //eventText: element.EventTextIT,
              webAddress: element.ContactInfos[this.currentlanguage].Url,
              dateperiod: this.getPeriod(startDate, endDate),
              startDate: this.formatDate(startDate),
              endDate: this.formatDate(endDate),
              nextBeginDate: nextbegin[0],
              nextBeginTime: nextbegin[1],
            };
            this.events.push(event);
          }
        });
      });
    },
    rotateEvents() {
      // first update events
      this.fetchData();
    },
    rotateLanguage() {
      let index = this.languages.indexOf(this.currentlanguage) + 1;

      if (index >= this.languages.length) index = 0;
      this.currentlanguage = this.languages[index];

      console.log("language changed to: " + this.currentlanguage);
      // first update events
      this.fetchData();
    },
    currentDate() {
      let locale = "en-GB";
      if (this.currentlanguage == "de") locale = "de-DE";
      if (this.currentlanguage == "it") locale = "it-IT";
      const current = new Date();
      return current
        .toLocaleDateString(locale, {
          month: "long",
          year: "numeric",
          day: "numeric",
        })
        .replace(",", "")
        .toUpperCase();
    },
    getLocationToShow(event, locationToShow, language) {
      if (locationToShow == "district")
        return event.LocationInfo.DistrictInfo.Name[language];
      if (locationToShow == "municipality")
        return event.LocationInfo.MunicipalityInfo.Name[language];
      if (locationToShow == "tourismorganization")
        return event.LocationInfo.TvInfo.Name[language];
      if (locationToShow == "region")
        return event.LocationInfo.RegionInfo?.Name[language];
      if (locationToShow == "location")
        return event.EventAdditionalInfos[language].Location;
      else return event.LocationInfo.DistrictInfo.Name[language];
    },
    getNextBeginDate(eventdate) {
      let nextbegindate = null;
      let nextbegintime = null;
      let now = Date.now();
      let tempdifference = 9999999999999;

      eventdate.forEach((value) => {
        var fullstartdate = new Date(
          value.From.replace("00:00:00", value.Begin)
        );
        var fullenddate = new Date(value.To.replace("00:00:00", value.End));

        //If Eventdate is defined as single Days
        if (value.From == value.To) {
          //calculate timediff from now and get closest greater than
          var difference = fullstartdate - now;
          var hasended = fullenddate - now;

          if (hasended >= 0 && difference <= 0) difference = 0;

          //Only if has not ended and the difference is the minimum
          if (hasended >= 0 && difference <= tempdifference) {
            nextbegindate = new Date(value.From);

            if (
              value.Begin.startsWith("00:00") &&
              value.End.startsWith("23:59")
            )
              nextbegintime = "all day";
            else
              nextbegintime =
                value.Begin.substring(0, 5) + " - " + value.End.substring(0, 5);
            tempdifference = difference;
          }
        }
        //If interval is valid set datetime now as date
        else {
          if (new Date(value.From) <= now && new Date(value.To) >= now) {
            nextbegindate = now;
            nextbegintime = "no info";
          }
        }
      });

      //console.log(nextbegindate);

      return [nextbegindate, nextbegintime];
    },
    getPeriod(startDate, endDate) {
      var period = this.formatDate(startDate);
      if (startDate.valueOf() != endDate.valueOf()) {
        period = period + " - " + this.formatDate(endDate);
      }

      return period;
    },
    formatTime(date) {
      return moment(date).format("HH:mm");
    },
    formatDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    getNow: function () {
      const today = new Date();
      const time =
        today.getHours() +
        ":" +
        (today.getMinutes() < 10 ? "0" : "") +
        today.getMinutes();
      this.timestamp = time;
    },
  },
};
</script>

<style>
@import "~bootstrap/dist/css/bootstrap.min.css";

.full-height {
  /* height: 100%; */
}

.content {
  padding: 0;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 5em;
  padding: 25px;
  margin: 0;
}

h2 {
  font-size: 2.3em;
}

h2 small {
  font-size: 65%;
  line-height: 1;
  font-weight: bold;
  color: #8c8c8c;
}

h1.title {
  padding: 5px;
  font-size: 48px;
}

.slideshow-container {
  position: relative;
  padding: 15px;
  /* background-color: #3c763d; */
  min-height: 85vh;
  border-radius: 15px;
}

.line {
  background-color: white;
  margin: 0;
  margin-bottom: 15px;
  padding: 0 25px;
  position: relative;
  display: block;
  height: 17vh;
  border-radius: 15px;
}

.line > div {
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}

body {
  /* font-family: "Source Sans Pro", sans-serif; */
  width: 100%;
  text-align: center;
  color: #000;
  font-size: 16px;
  margin: 0;
  min-height: 100vh;
  height: 100%;
  padding-bottom: 20px;
}

body > div {
  width: 100%;
}

.location {
  color: #fff;
  /* background-color: black; */
  padding: 10px 26px;
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 1.6em;
  font-weight: bold;
  max-width: 70%;
  /* min-width: 50%; */
  border-radius: 15px;
}

.location a {
  color: #000000;
}

.description {
  text-align: left;
}

a {
  color: #000;
  text-decoration: underline;
}

a.room {
  color: #ffffff;
}

.noi-logo {
  width: 155px;
  margin: 20px;
}

strong {
  font-weight: 600;
}

.starts-in {
  text-align: right;
  font-size: 2em;
  line-height: 1;
  justify-content: right;
  min-width: 20%;
}

.starts-in strong {
  font-size: 1.25em;
}

.starts-in small {
  color: #8c8c8c;
}

.footer {
  padding-top: 20px;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: right;
  z-index: 100001;
}
.footer-text {
  color: white;
}

#current-date-time {
  font-size: 48px;
}

#date {
  padding-right: 30px;
  font-size: 48px;
}

#time {
  padding-right: 10px;
  font-size: 28px;
  color: #b2b5b6;
  font-weight: bold;
  vertical-align: middle;
}

@media screen and (min-width: 320px) and (max-width: 812px) {
  h1 {
    font-size: 2.6em;
  }

  header {
    display: block;
  }

  header .pull-left,
  header .pull-right {
    float: none !important;
  }

  .line {
    font-size: 12px;
    padding: 0;
    height: auto;
  }

  body {
    overflow: auto;
    padding-top: 2vh;
  }

  .clock {
    font-size: 1em;
  }

  .slideshow-container {
    height: max-content;
  }
}

@media screen and (min-width: 320px) and (max-width: 812px) and (orientation: portrait) {
  .location {
    max-width: none;
    margin: 0 40px;
  }

  .line > div {
    display: block;
  }

  .starts-in {
    padding: 15px;
  }

  .starts-in,
  .description {
    text-align: center;
  }

  .slideshow-container {
    height: max-content;
  }
}

@media screen and (min-width: 992px) and (max-height: 901px) and (orientation: landscape) {
  body {
    font-size: 10px;
  }
}

@media screen and (max-width: 1441px) and (max-height: 901px) and (orientation: landscape) {
  body {
    font-size: 12px;
  }
}

@media screen and (max-width: 1280px) and (min-height: 1024px) and (orientation: landscape) {
  body {
    font-size: 16px;
  }
}

@media screen and (max-width: 1600px) and (min-height: 900px) and (orientation: landscape) {
  body {
    font-size: 14px;
  }
}

@media screen and (max-width: 992px) and (min-width: 812px) and (orientation: landscape) {
  body {
    font-size: 8px;
  }
}
</style>
