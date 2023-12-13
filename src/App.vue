<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <EventsUpcoming
    :options="{
      locationFilter: locationFilter,
      language: language,
      maxEvents: maxEvents,
      eventRotationInterval: eventRotationInterval,
      languageRotationInterval: languageRotationInterval,
      imageGalleryInterval: imageGalleryInterval,
      imageGalleryUrl: imageGalleryUrl,
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
    topic: {
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
    eventRotationInterval: {
      type: Number,
      default: 60,
    },
    languageRotationInterval: {
      type: Number,
      default: 10,
    },
    imageGalleryUrl: {
      type: String,
      default:
        "https://s3.eu-west-1.amazonaws.com/it.bz.noi.today.eurac.gallery",
    },
    imageGalleryInterval: {
      type: Number,
      default: 60,
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
