// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: CC0-1.0

const CopyWebpackPlugin = require("copy-webpack-plugin");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  configureWebpack: {
    watchOptions: {
      ignored: /node_modules/,
    },
  },
  chainWebpack: (config) => {
    config.module.rule("images").set("parser", {
      dataUrlCondition: {
        maxSize: 300 * 1024,
      },
    });

    // the wc build target doesn't copy public/ automatically, so demo
    // pages for other themes need to be copied explicitly
    config.plugin("copy-theme-demos").use(CopyWebpackPlugin, [
      {
        patterns: [
          { from: "public/demo_noi.html", to: "demo_noi.html" },
          { from: "public/demo_eurac.html", to: "demo_eurac.html" },
          { from: "public/demo_orange.html", to: "demo_orange.html" },
        ],
      },
    ]);
  },
  css: {
    loaderOptions: {
      css: {
        import: true,
      },
    },
  },
});
