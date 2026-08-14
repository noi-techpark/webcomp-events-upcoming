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
      const baseURL = process.env.VUE_APP_TOURISM_BASE_PATH + "/v1/Event?";
      const params = new URLSearchParams([
        ["begindate", this.formatDateAndTime(new Date())],
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
                element.Detail?.[this.currentlanguage]?.Title ?? "no title",
              eventLocation: this.getLocationToShow(
                element,
                this.options.locationToShow,
                this.currentlanguage
              ),
              //eventText: element.EventTextIT,
              webAddress: element.ContactInfos?.[this.currentlanguage]?.Url,
              dateperiod: this.getPeriod(
                startDate,
                endDate,
                element.EventAdditionalInfos?.[this.currentlanguage]
              ),
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
        return event.LocationInfo?.DistrictInfo?.Name?.[language];
      if (locationToShow == "municipality")
        return event.LocationInfo?.MunicipalityInfo?.Name?.[language];
      if (locationToShow == "tourismorganization")
        return event.LocationInfo?.TvInfo?.Name?.[language];
      if (locationToShow == "region")
        return event.LocationInfo?.RegionInfo?.Name?.[language];
      if (locationToShow == "location")
        return event.EventAdditionalInfos?.[language]?.Location;
      else return event.LocationInfo?.DistrictInfo?.Name?.[language];
    },
    getNextBeginDate(eventdate) {
      let nextbegindate = null;
      let nextbegintime = null;
      let now = Date.now();
      let tempdifference = 9999999999999;

      let allday = { de: "ganztägig", it: "giornata intera", en: "all day" };
      let noinfo = { de: "keine angabe", it: "senza info", en: "no info" };

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
              nextbegintime = allday[this.currentlanguage];
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
            nextbegintime = noinfo[this.currentlanguage];
          }
        }
      });

      //console.log(nextbegindate);

      return [nextbegindate, nextbegintime];
    },
    getPeriod(startDate, endDate, additionalinfo) {
      var period = this.formatDate(startDate);

      if (startDate.getDate().valueOf() != endDate.getDate().valueOf()) {
        period = period + " - " + this.formatDate(endDate);
      } else if (additionalinfo != null) {
        period = additionalinfo.Location;
      }

      return period;
    },
    formatTime(date) {
      return moment(date).format("HH:mm");
    },
    formatDate(date) {
      return moment(date).format("DD-MM-YYYY");
    },
    formatDateAndTime(date) {
      return moment(date).format("YYYY-MM-DD HH:mm");
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
