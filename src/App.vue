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
      languageRotationInterval: languageRotationInterval,
      fontName: fontName,
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
      default: "en",
    },
    source: {
      type: String,
      default: "",
    },
    maxEvents: {
      type: Number,
      default: 10,
    },
    locationToShow: {
      type: String,
      default: "district",
    },
    languageRotationInterval: {
      type: Number,
      default: 10,
    },
    fontUrl: {
      type: String,
      default:
        "https://s3.eu-west-1.amazonaws.com/it.bz.noi.today.eurac.gallery/milo-pro/style.css",
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
