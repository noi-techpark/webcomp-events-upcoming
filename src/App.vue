<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <EventsUpcoming
    :options="{
      locationFilter: location,
      language: language,
      source: source,
      maxEvents: maxEvents,
      locationToShow: locationToShow,
      eventRotationInterval: eventRotationInterval,
      languageRotationInterval: languageRotationInterval,
      backgroundColor: backgroundColor,
      fontName: fontName,
      fontUrl: fontUrl,
      eventSortmode: eventSortmode,
    }"
  />
</template>
<script>
import EventsUpcoming from "./components/EventsUpcoming.vue";
export default {
  name: "App",
  props: {
    location: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "de",
    },
    source: {
      type: String,
      default: "",
    },
    maxEvents: {
      type: Number,
      default: 20,
    },
    locationToShow: {
      type: String,
      default: "district",
    },
    eventSortmode: {
      type: String,
      default: "upcomingspecial",
    },
    eventRotationInterval: {
      type: Number,
      default: 600,
    },
    languageRotationInterval: {
      type: Number,
      default: 30,
    },
    backgroundColor: {
      type: String,
      default: "#3c763d",
    },
    fontUrl: {
      type: String,
      default:
        "https://s3.eu-west-1.amazonaws.com/noi-fonts/open-sans/style.css",
    },
    fontName: {
      type: String,
      default: "Milo Bold",
    },
  },
  components: {
    EventsUpcoming,
  },
  created: function () {
    this.fetchFont(this.fontUrl).then((font) => {
      // inject font after creation, because @font-face is not supported by shadow DOM
      let fontFaceSheet = new CSSStyleSheet();
      fontFaceSheet.replaceSync(font);
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        fontFaceSheet,
      ];
    });
  },
  methods: {
    async fetchFont(url) {
      const response = await fetch(url);
      return await response.text();
    },
  },
};
</script>
