// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import Vue from "vue";
import wrap from "@vue/web-component-wrapper";
import App from "./App.vue";

const CustomElement = wrap(Vue, App);
window.customElements.define("events-upcoming", CustomElement, {
  shadow: true,
});
