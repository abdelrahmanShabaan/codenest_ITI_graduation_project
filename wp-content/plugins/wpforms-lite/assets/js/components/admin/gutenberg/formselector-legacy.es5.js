(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global wpforms_gutenberg_form_selector */
/* jshint es3: false, esversion: 6 */

'use strict';

var _wp = wp,
  _wp$serverSideRender = _wp.serverSideRender,
  ServerSideRender = _wp$serverSideRender === void 0 ? wp.components.ServerSideRender : _wp$serverSideRender;
var _wp$element = wp.element,
  createElement = _wp$element.createElement,
  Fragment = _wp$element.Fragment;
var registerBlockType = wp.blocks.registerBlockType;
var _ref = wp.blockEditor || wp.editor,
  InspectorControls = _ref.InspectorControls;
var _wp$components = wp.components,
  SelectControl = _wp$components.SelectControl,
  ToggleControl = _wp$components.ToggleControl,
  PanelBody = _wp$components.PanelBody,
  Placeholder = _wp$components.Placeholder;
var __ = wp.i18n.__;
var wpformsIcon = createElement('svg', {
  width: 20,
  height: 20,
  viewBox: '0 0 612 612',
  className: 'dashicon'
}, createElement('path', {
  fill: 'currentColor',
  d: 'M544,0H68C30.445,0,0,30.445,0,68v476c0,37.556,30.445,68,68,68h476c37.556,0,68-30.444,68-68V68 C612,30.445,581.556,0,544,0z M464.44,68L387.6,120.02L323.34,68H464.44z M288.66,68l-64.26,52.02L147.56,68H288.66z M544,544H68 V68h22.1l136,92.14l79.9-64.6l79.56,64.6l136-92.14H544V544z M114.24,263.16h95.88v-48.28h-95.88V263.16z M114.24,360.4h95.88 v-48.62h-95.88V360.4z M242.76,360.4h255v-48.62h-255V360.4L242.76,360.4z M242.76,263.16h255v-48.28h-255V263.16L242.76,263.16z M368.22,457.3h129.54V408H368.22V457.3z'
}));

/**
 * Popup container.
 *
 * @since 1.8.3
 *
 * @type {object}
 */
var $popup = {};

/**
 * Close button (inside the form builder) click event.
 *
 * @since 1.8.3
 *
 * @param {string} clientID Block Client ID.
 */
var builderCloseButtonEvent = function builderCloseButtonEvent(clientID) {
  $popup.off('wpformsBuilderInPopupClose').on('wpformsBuilderInPopupClose', function (e, action, formId, formTitle) {
    if (action !== 'saved' || !formId) {
      return;
    }

    // Insert a new block when a new form is created from the popup to update the form list and attributes.
    var newBlock = wp.blocks.createBlock('wpforms/form-selector', {
      formId: formId.toString() // Expects string value, make sure we insert string.
    });

    // eslint-disable-next-line camelcase
    wpforms_gutenberg_form_selector.forms = [{
      ID: formId,
      post_title: formTitle
    }];

    // Insert a new block.
    wp.data.dispatch('core/block-editor').removeBlock(clientID);
    wp.data.dispatch('core/block-editor').insertBlocks(newBlock);
  });
};

/**
 * Open builder popup.
 *
 * @since 1.6.2
 *
 * @param {string} clientID Block Client ID.
 */
var openBuilderPopup = function openBuilderPopup(clientID) {
  if (jQuery.isEmptyObject($popup)) {
    var tmpl = jQuery('#wpforms-gutenberg-popup');
    var parent = jQuery('#wpwrap');
    parent.after(tmpl);
    $popup = parent.siblings('#wpforms-gutenberg-popup');
  }
  var url = wpforms_gutenberg_form_selector.get_started_url,
    $iframe = $popup.find('iframe');
  builderCloseButtonEvent(clientID);
  $iframe.attr('src', url);
  $popup.fadeIn();
};
var hasForms = function hasForms() {
  return wpforms_gutenberg_form_selector.forms.length > 0;
};
registerBlockType('wpforms/form-selector', {
  title: wpforms_gutenberg_form_selector.strings.title,
  description: wpforms_gutenberg_form_selector.strings.description,
  icon: wpformsIcon,
  keywords: wpforms_gutenberg_form_selector.strings.form_keywords,
  category: 'widgets',
  attributes: {
    formId: {
      type: 'string'
    },
    displayTitle: {
      type: 'boolean'
    },
    displayDesc: {
      type: 'boolean'
    },
    preview: {
      type: 'boolean'
    }
  },
  example: {
    attributes: {
      preview: true
    }
  },
  supports: {
    customClassName: hasForms()
  },
  edit: function edit(props) {
    // eslint-disable-line max-lines-per-function
    var _props$attributes = props.attributes,
      _props$attributes$for = _props$attributes.formId,
      formId = _props$attributes$for === void 0 ? '' : _props$attributes$for,
      _props$attributes$dis = _props$attributes.displayTitle,
      displayTitle = _props$attributes$dis === void 0 ? false : _props$attributes$dis,
      _props$attributes$dis2 = _props$attributes.displayDesc,
      displayDesc = _props$attributes$dis2 === void 0 ? false : _props$attributes$dis2,
      _props$attributes$pre = _props$attributes.preview,
      preview = _props$attributes$pre === void 0 ? false : _props$attributes$pre,
      setAttributes = props.setAttributes;
    var formOptions = wpforms_gutenberg_form_selector.forms.map(function (value) {
      return {
        value: value.ID,
        label: value.post_title
      };
    });
    var strings = wpforms_gutenberg_form_selector.strings;
    var jsx;
    formOptions.unshift({
      value: '',
      label: wpforms_gutenberg_form_selector.strings.form_select
    });
    function selectForm(value) {
      // eslint-disable-line jsdoc/require-jsdoc
      setAttributes({
        formId: value
      });
    }
    function toggleDisplayTitle(value) {
      // eslint-disable-line jsdoc/require-jsdoc
      setAttributes({
        displayTitle: value
      });
    }
    function toggleDisplayDesc(value) {
      // eslint-disable-line jsdoc/require-jsdoc
      setAttributes({
        displayDesc: value
      });
    }

    /**
     * Get block empty JSX code.
     *
     * @since 1.8.3
     *
     * @param {object} props Block properties.
     * @returns {JSX.Element} Block empty JSX code.
     */
    function getEmptyFormsPreview(props) {
      var clientId = props.clientId;
      return /*#__PURE__*/React.createElement(Fragment, {
        key: "wpforms-gutenberg-form-selector-fragment-block-empty"
      }, /*#__PURE__*/React.createElement("div", {
        className: "wpforms-no-form-preview"
      }, /*#__PURE__*/React.createElement("img", {
        src: wpforms_gutenberg_form_selector.block_empty_url
      }), /*#__PURE__*/React.createElement("p", {
        dangerouslySetInnerHTML: {
          __html: strings.wpforms_empty_info
        }
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "get-started-button components-button is-button is-primary",
        onClick: function onClick() {
          openBuilderPopup(clientId);
        }
      }, __('Get Started', 'wpforms-lite')), /*#__PURE__*/React.createElement("p", {
        className: "empty-desc",
        dangerouslySetInnerHTML: {
          __html: strings.wpforms_empty_help
        }
      }), /*#__PURE__*/React.createElement("div", {
        id: "wpforms-gutenberg-popup",
        className: "wpforms-builder-popup"
      }, /*#__PURE__*/React.createElement("iframe", {
        src: "about:blank",
        width: "100%",
        height: "100%",
        id: "wpforms-builder-iframe"
      }))));
    }

    /**
     * Print empty forms notice.
     *
     * @since 1.8.3
     *
     * @param {string} clientId Block client ID.
     *
     * @returns {JSX.Element} Field styles JSX code.
     */
    function printEmptyFormsNotice(clientId) {
      return /*#__PURE__*/React.createElement(InspectorControls, {
        key: "wpforms-gutenberg-form-selector-inspector-main-settings"
      }, /*#__PURE__*/React.createElement(PanelBody, {
        className: "wpforms-gutenberg-panel",
        title: strings.form_settings
      }, /*#__PURE__*/React.createElement("p", {
        className: "wpforms-gutenberg-panel-notice wpforms-warning wpforms-empty-form-notice",
        style: {
          display: 'block'
        }
      }, /*#__PURE__*/React.createElement("strong", null, __('You haven’t created a form, yet!', 'wpforms-lite')), __('What are you waiting for?', 'wpforms-lite')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "get-started-button components-button is-button is-secondary",
        onClick: function onClick() {
          openBuilderPopup(clientId);
        }
      }, __('Get Started', 'wpforms-lite'))));
    }
    if (!hasForms()) {
      jsx = [printEmptyFormsNotice(props.clientId)];
      jsx.push(getEmptyFormsPreview(props));
      return jsx;
    }
    jsx = [/*#__PURE__*/React.createElement(InspectorControls, {
      key: "wpforms-gutenberg-form-selector-inspector-controls"
    }, /*#__PURE__*/React.createElement(PanelBody, {
      title: wpforms_gutenberg_form_selector.strings.form_settings
    }, /*#__PURE__*/React.createElement(SelectControl, {
      label: wpforms_gutenberg_form_selector.strings.form_selected,
      value: formId,
      options: formOptions,
      onChange: selectForm
    }), /*#__PURE__*/React.createElement(ToggleControl, {
      label: wpforms_gutenberg_form_selector.strings.show_title,
      checked: displayTitle,
      onChange: toggleDisplayTitle
    }), /*#__PURE__*/React.createElement(ToggleControl, {
      label: wpforms_gutenberg_form_selector.strings.show_description,
      checked: displayDesc,
      onChange: toggleDisplayDesc
    }), /*#__PURE__*/React.createElement("p", {
      className: "wpforms-gutenberg-panel-notice"
    }, /*#__PURE__*/React.createElement("strong", null, strings.update_wp_notice_head), strings.update_wp_notice_text, " ", /*#__PURE__*/React.createElement("a", {
      href: strings.update_wp_notice_link,
      rel: "noreferrer",
      target: "_blank"
    }, strings.learn_more))))];
    if (formId) {
      jsx.push( /*#__PURE__*/React.createElement(ServerSideRender, {
        key: "wpforms-gutenberg-form-selector-server-side-renderer",
        block: "wpforms/form-selector",
        attributes: props.attributes
      }));
    } else if (preview) {
      jsx.push( /*#__PURE__*/React.createElement(Fragment, {
        key: "wpforms-gutenberg-form-selector-fragment-block-preview"
      }, /*#__PURE__*/React.createElement("img", {
        src: wpforms_gutenberg_form_selector.block_preview_url,
        style: {
          width: '100%'
        }
      })));
    } else {
      jsx.push( /*#__PURE__*/React.createElement(Placeholder, {
        key: "wpforms-gutenberg-form-selector-wrap",
        className: "wpforms-gutenberg-form-selector-wrap"
      }, /*#__PURE__*/React.createElement("img", {
        src: wpforms_gutenberg_form_selector.logo_url
      }), /*#__PURE__*/React.createElement("h3", null, wpforms_gutenberg_form_selector.strings.title), /*#__PURE__*/React.createElement(SelectControl, {
        key: "wpforms-gutenberg-form-selector-select-control",
        value: formId,
        options: formOptions,
        onChange: selectForm
      })));
    }
    return jsx;
  },
  save: function save() {
    return null;
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfd3AiLCJ3cCIsIl93cCRzZXJ2ZXJTaWRlUmVuZGVyIiwic2VydmVyU2lkZVJlbmRlciIsIlNlcnZlclNpZGVSZW5kZXIiLCJjb21wb25lbnRzIiwiX3dwJGVsZW1lbnQiLCJlbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsIkZyYWdtZW50IiwicmVnaXN0ZXJCbG9ja1R5cGUiLCJibG9ja3MiLCJfcmVmIiwiYmxvY2tFZGl0b3IiLCJlZGl0b3IiLCJJbnNwZWN0b3JDb250cm9scyIsIl93cCRjb21wb25lbnRzIiwiU2VsZWN0Q29udHJvbCIsIlRvZ2dsZUNvbnRyb2wiLCJQYW5lbEJvZHkiLCJQbGFjZWhvbGRlciIsIl9fIiwiaTE4biIsIndwZm9ybXNJY29uIiwid2lkdGgiLCJoZWlnaHQiLCJ2aWV3Qm94IiwiY2xhc3NOYW1lIiwiZmlsbCIsImQiLCIkcG9wdXAiLCJidWlsZGVyQ2xvc2VCdXR0b25FdmVudCIsImNsaWVudElEIiwib2ZmIiwib24iLCJlIiwiYWN0aW9uIiwiZm9ybUlkIiwiZm9ybVRpdGxlIiwibmV3QmxvY2siLCJjcmVhdGVCbG9jayIsInRvU3RyaW5nIiwid3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3RvciIsImZvcm1zIiwiSUQiLCJwb3N0X3RpdGxlIiwiZGF0YSIsImRpc3BhdGNoIiwicmVtb3ZlQmxvY2siLCJpbnNlcnRCbG9ja3MiLCJvcGVuQnVpbGRlclBvcHVwIiwialF1ZXJ5IiwiaXNFbXB0eU9iamVjdCIsInRtcGwiLCJwYXJlbnQiLCJhZnRlciIsInNpYmxpbmdzIiwidXJsIiwiZ2V0X3N0YXJ0ZWRfdXJsIiwiJGlmcmFtZSIsImZpbmQiLCJhdHRyIiwiZmFkZUluIiwiaGFzRm9ybXMiLCJsZW5ndGgiLCJ0aXRsZSIsInN0cmluZ3MiLCJkZXNjcmlwdGlvbiIsImljb24iLCJrZXl3b3JkcyIsImZvcm1fa2V5d29yZHMiLCJjYXRlZ29yeSIsImF0dHJpYnV0ZXMiLCJ0eXBlIiwiZGlzcGxheVRpdGxlIiwiZGlzcGxheURlc2MiLCJwcmV2aWV3IiwiZXhhbXBsZSIsInN1cHBvcnRzIiwiY3VzdG9tQ2xhc3NOYW1lIiwiZWRpdCIsInByb3BzIiwiX3Byb3BzJGF0dHJpYnV0ZXMiLCJfcHJvcHMkYXR0cmlidXRlcyRmb3IiLCJfcHJvcHMkYXR0cmlidXRlcyRkaXMiLCJfcHJvcHMkYXR0cmlidXRlcyRkaXMyIiwiX3Byb3BzJGF0dHJpYnV0ZXMkcHJlIiwic2V0QXR0cmlidXRlcyIsImZvcm1PcHRpb25zIiwibWFwIiwidmFsdWUiLCJsYWJlbCIsImpzeCIsInVuc2hpZnQiLCJmb3JtX3NlbGVjdCIsInNlbGVjdEZvcm0iLCJ0b2dnbGVEaXNwbGF5VGl0bGUiLCJ0b2dnbGVEaXNwbGF5RGVzYyIsImdldEVtcHR5Rm9ybXNQcmV2aWV3IiwiY2xpZW50SWQiLCJSZWFjdCIsImtleSIsInNyYyIsImJsb2NrX2VtcHR5X3VybCIsImRhbmdlcm91c2x5U2V0SW5uZXJIVE1MIiwiX19odG1sIiwid3Bmb3Jtc19lbXB0eV9pbmZvIiwib25DbGljayIsIndwZm9ybXNfZW1wdHlfaGVscCIsImlkIiwicHJpbnRFbXB0eUZvcm1zTm90aWNlIiwiZm9ybV9zZXR0aW5ncyIsInN0eWxlIiwiZGlzcGxheSIsInB1c2giLCJmb3JtX3NlbGVjdGVkIiwib3B0aW9ucyIsIm9uQ2hhbmdlIiwic2hvd190aXRsZSIsImNoZWNrZWQiLCJzaG93X2Rlc2NyaXB0aW9uIiwidXBkYXRlX3dwX25vdGljZV9oZWFkIiwidXBkYXRlX3dwX25vdGljZV90ZXh0IiwiaHJlZiIsInVwZGF0ZV93cF9ub3RpY2VfbGluayIsInJlbCIsInRhcmdldCIsImxlYXJuX21vcmUiLCJibG9jayIsImJsb2NrX3ByZXZpZXdfdXJsIiwibG9nb191cmwiLCJzYXZlIl0sInNvdXJjZXMiOlsiZmFrZV9jOWNlY2Y1LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCB3cGZvcm1zX2d1dGVuYmVyZ19mb3JtX3NlbGVjdG9yICovXG4vKiBqc2hpbnQgZXMzOiBmYWxzZSwgZXN2ZXJzaW9uOiA2ICovXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBzZXJ2ZXJTaWRlUmVuZGVyOiBTZXJ2ZXJTaWRlUmVuZGVyID0gd3AuY29tcG9uZW50cy5TZXJ2ZXJTaWRlUmVuZGVyIH0gPSB3cDtcbmNvbnN0IHsgY3JlYXRlRWxlbWVudCwgRnJhZ21lbnQgfSA9IHdwLmVsZW1lbnQ7XG5jb25zdCB7IHJlZ2lzdGVyQmxvY2tUeXBlIH0gPSB3cC5ibG9ja3M7XG5jb25zdCB7IEluc3BlY3RvckNvbnRyb2xzIH0gPSB3cC5ibG9ja0VkaXRvciB8fCB3cC5lZGl0b3I7XG5jb25zdCB7IFNlbGVjdENvbnRyb2wsIFRvZ2dsZUNvbnRyb2wsIFBhbmVsQm9keSwgUGxhY2Vob2xkZXIgfSA9IHdwLmNvbXBvbmVudHM7XG5jb25zdCB7IF9fIH0gPSB3cC5pMThuO1xuXG5jb25zdCB3cGZvcm1zSWNvbiA9IGNyZWF0ZUVsZW1lbnQoICdzdmcnLCB7IHdpZHRoOiAyMCwgaGVpZ2h0OiAyMCwgdmlld0JveDogJzAgMCA2MTIgNjEyJywgY2xhc3NOYW1lOiAnZGFzaGljb24nIH0sXG5cdGNyZWF0ZUVsZW1lbnQoICdwYXRoJywge1xuXHRcdGZpbGw6ICdjdXJyZW50Q29sb3InLFxuXHRcdGQ6ICdNNTQ0LDBINjhDMzAuNDQ1LDAsMCwzMC40NDUsMCw2OHY0NzZjMCwzNy41NTYsMzAuNDQ1LDY4LDY4LDY4aDQ3NmMzNy41NTYsMCw2OC0zMC40NDQsNjgtNjhWNjggQzYxMiwzMC40NDUsNTgxLjU1NiwwLDU0NCwweiBNNDY0LjQ0LDY4TDM4Ny42LDEyMC4wMkwzMjMuMzQsNjhINDY0LjQ0eiBNMjg4LjY2LDY4bC02NC4yNiw1Mi4wMkwxNDcuNTYsNjhIMjg4LjY2eiBNNTQ0LDU0NEg2OCBWNjhoMjIuMWwxMzYsOTIuMTRsNzkuOS02NC42bDc5LjU2LDY0LjZsMTM2LTkyLjE0SDU0NFY1NDR6IE0xMTQuMjQsMjYzLjE2aDk1Ljg4di00OC4yOGgtOTUuODhWMjYzLjE2eiBNMTE0LjI0LDM2MC40aDk1Ljg4IHYtNDguNjJoLTk1Ljg4VjM2MC40eiBNMjQyLjc2LDM2MC40aDI1NXYtNDguNjJoLTI1NVYzNjAuNEwyNDIuNzYsMzYwLjR6IE0yNDIuNzYsMjYzLjE2aDI1NXYtNDguMjhoLTI1NVYyNjMuMTZMMjQyLjc2LDI2My4xNnogTTM2OC4yMiw0NTcuM2gxMjkuNTRWNDA4SDM2OC4yMlY0NTcuM3onLFxuXHR9IClcbik7XG5cbi8qKlxuICogUG9wdXAgY29udGFpbmVyLlxuICpcbiAqIEBzaW5jZSAxLjguM1xuICpcbiAqIEB0eXBlIHtvYmplY3R9XG4gKi9cbmxldCAkcG9wdXAgPSB7fTtcblxuLyoqXG4gKiBDbG9zZSBidXR0b24gKGluc2lkZSB0aGUgZm9ybSBidWlsZGVyKSBjbGljayBldmVudC5cbiAqXG4gKiBAc2luY2UgMS44LjNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY2xpZW50SUQgQmxvY2sgQ2xpZW50IElELlxuICovXG5jb25zdCBidWlsZGVyQ2xvc2VCdXR0b25FdmVudCA9IGZ1bmN0aW9uKCBjbGllbnRJRCApIHtcblxuXHQkcG9wdXBcblx0XHQub2ZmKCAnd3Bmb3Jtc0J1aWxkZXJJblBvcHVwQ2xvc2UnIClcblx0XHQub24oICd3cGZvcm1zQnVpbGRlckluUG9wdXBDbG9zZScsIGZ1bmN0aW9uKCBlLCBhY3Rpb24sIGZvcm1JZCwgZm9ybVRpdGxlICkge1xuXHRcdFx0aWYgKCBhY3Rpb24gIT09ICdzYXZlZCcgfHwgISBmb3JtSWQgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSW5zZXJ0IGEgbmV3IGJsb2NrIHdoZW4gYSBuZXcgZm9ybSBpcyBjcmVhdGVkIGZyb20gdGhlIHBvcHVwIHRvIHVwZGF0ZSB0aGUgZm9ybSBsaXN0IGFuZCBhdHRyaWJ1dGVzLlxuXHRcdFx0Y29uc3QgbmV3QmxvY2sgPSB3cC5ibG9ja3MuY3JlYXRlQmxvY2soICd3cGZvcm1zL2Zvcm0tc2VsZWN0b3InLCB7XG5cdFx0XHRcdGZvcm1JZDogZm9ybUlkLnRvU3RyaW5nKCksIC8vIEV4cGVjdHMgc3RyaW5nIHZhbHVlLCBtYWtlIHN1cmUgd2UgaW5zZXJ0IHN0cmluZy5cblx0XHRcdH0gKTtcblxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuXHRcdFx0d3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5mb3JtcyA9IFsgeyBJRDogZm9ybUlkLCBwb3N0X3RpdGxlOiBmb3JtVGl0bGUgfSBdO1xuXG5cdFx0XHQvLyBJbnNlcnQgYSBuZXcgYmxvY2suXG5cdFx0XHR3cC5kYXRhLmRpc3BhdGNoKCAnY29yZS9ibG9jay1lZGl0b3InICkucmVtb3ZlQmxvY2soIGNsaWVudElEICk7XG5cdFx0XHR3cC5kYXRhLmRpc3BhdGNoKCAnY29yZS9ibG9jay1lZGl0b3InICkuaW5zZXJ0QmxvY2tzKCBuZXdCbG9jayApO1xuXG5cdFx0fSApO1xufTtcblxuLyoqXG4gKiBPcGVuIGJ1aWxkZXIgcG9wdXAuXG4gKlxuICogQHNpbmNlIDEuNi4yXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNsaWVudElEIEJsb2NrIENsaWVudCBJRC5cbiAqL1xuY29uc3Qgb3BlbkJ1aWxkZXJQb3B1cCA9IGZ1bmN0aW9uKCBjbGllbnRJRCApIHtcblxuXHRpZiAoIGpRdWVyeS5pc0VtcHR5T2JqZWN0KCAkcG9wdXAgKSApIHtcblx0XHRsZXQgdG1wbCA9IGpRdWVyeSggJyN3cGZvcm1zLWd1dGVuYmVyZy1wb3B1cCcgKTtcblx0XHRsZXQgcGFyZW50ID0galF1ZXJ5KCAnI3dwd3JhcCcgKTtcblxuXHRcdHBhcmVudC5hZnRlciggdG1wbCApO1xuXG5cdFx0JHBvcHVwID0gcGFyZW50LnNpYmxpbmdzKCAnI3dwZm9ybXMtZ3V0ZW5iZXJnLXBvcHVwJyApO1xuXHR9XG5cblx0Y29uc3QgdXJsID0gd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5nZXRfc3RhcnRlZF91cmwsXG5cdFx0JGlmcmFtZSA9ICRwb3B1cC5maW5kKCAnaWZyYW1lJyApO1xuXG5cdGJ1aWxkZXJDbG9zZUJ1dHRvbkV2ZW50KCBjbGllbnRJRCApO1xuXHQkaWZyYW1lLmF0dHIoICdzcmMnLCB1cmwgKTtcblx0JHBvcHVwLmZhZGVJbigpO1xufTtcblxuY29uc3QgaGFzRm9ybXMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHdwZm9ybXNfZ3V0ZW5iZXJnX2Zvcm1fc2VsZWN0b3IuZm9ybXMubGVuZ3RoID4gMDtcbn07XG5cbnJlZ2lzdGVyQmxvY2tUeXBlKCAnd3Bmb3Jtcy9mb3JtLXNlbGVjdG9yJywge1xuXHR0aXRsZTogd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5zdHJpbmdzLnRpdGxlLFxuXHRkZXNjcmlwdGlvbjogd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5zdHJpbmdzLmRlc2NyaXB0aW9uLFxuXHRpY29uOiB3cGZvcm1zSWNvbixcblx0a2V5d29yZHM6IHdwZm9ybXNfZ3V0ZW5iZXJnX2Zvcm1fc2VsZWN0b3Iuc3RyaW5ncy5mb3JtX2tleXdvcmRzLFxuXHRjYXRlZ29yeTogJ3dpZGdldHMnLFxuXHRhdHRyaWJ1dGVzOiB7XG5cdFx0Zm9ybUlkOiB7XG5cdFx0XHR0eXBlOiAnc3RyaW5nJyxcblx0XHR9LFxuXHRcdGRpc3BsYXlUaXRsZToge1xuXHRcdFx0dHlwZTogJ2Jvb2xlYW4nLFxuXHRcdH0sXG5cdFx0ZGlzcGxheURlc2M6IHtcblx0XHRcdHR5cGU6ICdib29sZWFuJyxcblx0XHR9LFxuXHRcdHByZXZpZXc6IHtcblx0XHRcdHR5cGU6ICdib29sZWFuJyxcblx0XHR9LFxuXHR9LFxuXHRleGFtcGxlOiB7XG5cdFx0YXR0cmlidXRlczoge1xuXHRcdFx0cHJldmlldzogdHJ1ZSxcblx0XHR9LFxuXHR9LFxuXHRzdXBwb3J0czoge1xuXHRcdGN1c3RvbUNsYXNzTmFtZTogaGFzRm9ybXMoKSxcblx0fSxcblx0ZWRpdCggcHJvcHMgKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbWF4LWxpbmVzLXBlci1mdW5jdGlvblxuXHRcdGNvbnN0IHsgYXR0cmlidXRlczogeyBmb3JtSWQgPSAnJywgZGlzcGxheVRpdGxlID0gZmFsc2UsIGRpc3BsYXlEZXNjID0gZmFsc2UsIHByZXZpZXcgPSBmYWxzZSB9LCBzZXRBdHRyaWJ1dGVzIH0gPSBwcm9wcztcblx0XHRjb25zdCBmb3JtT3B0aW9ucyA9IHdwZm9ybXNfZ3V0ZW5iZXJnX2Zvcm1fc2VsZWN0b3IuZm9ybXMubWFwKCB2YWx1ZSA9PiAoXG5cdFx0XHR7IHZhbHVlOiB2YWx1ZS5JRCwgbGFiZWw6IHZhbHVlLnBvc3RfdGl0bGUgfVxuXHRcdCkgKTtcblxuXHRcdGNvbnN0IHN0cmluZ3MgPSB3cGZvcm1zX2d1dGVuYmVyZ19mb3JtX3NlbGVjdG9yLnN0cmluZ3M7XG5cdFx0bGV0IGpzeDtcblxuXHRcdGZvcm1PcHRpb25zLnVuc2hpZnQoIHsgdmFsdWU6ICcnLCBsYWJlbDogd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5zdHJpbmdzLmZvcm1fc2VsZWN0IH0gKTtcblxuXHRcdGZ1bmN0aW9uIHNlbGVjdEZvcm0oIHZhbHVlICkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGpzZG9jL3JlcXVpcmUtanNkb2Ncblx0XHRcdHNldEF0dHJpYnV0ZXMoIHsgZm9ybUlkOiB2YWx1ZSB9ICk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdG9nZ2xlRGlzcGxheVRpdGxlKCB2YWx1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBqc2RvYy9yZXF1aXJlLWpzZG9jXG5cdFx0XHRzZXRBdHRyaWJ1dGVzKCB7IGRpc3BsYXlUaXRsZTogdmFsdWUgfSApO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRvZ2dsZURpc3BsYXlEZXNjKCB2YWx1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBqc2RvYy9yZXF1aXJlLWpzZG9jXG5cdFx0XHRzZXRBdHRyaWJ1dGVzKCB7IGRpc3BsYXlEZXNjOiB2YWx1ZSB9ICk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGJsb2NrIGVtcHR5IEpTWCBjb2RlLlxuXHRcdCAqXG5cdFx0ICogQHNpbmNlIDEuOC4zXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge29iamVjdH0gcHJvcHMgQmxvY2sgcHJvcGVydGllcy5cblx0XHQgKiBAcmV0dXJucyB7SlNYLkVsZW1lbnR9IEJsb2NrIGVtcHR5IEpTWCBjb2RlLlxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEVtcHR5Rm9ybXNQcmV2aWV3KCBwcm9wcyApIHtcblxuXHRcdFx0Y29uc3QgY2xpZW50SWQgPSBwcm9wcy5jbGllbnRJZDtcblxuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEZyYWdtZW50XG5cdFx0XHRcdFx0a2V5PVwid3Bmb3Jtcy1ndXRlbmJlcmctZm9ybS1zZWxlY3Rvci1mcmFnbWVudC1ibG9jay1lbXB0eVwiPlxuXHRcdFx0XHRcdDxkaXYgY2xhc3NOYW1lPVwid3Bmb3Jtcy1uby1mb3JtLXByZXZpZXdcIj5cblx0XHRcdFx0XHRcdDxpbWcgc3JjPXsgd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5ibG9ja19lbXB0eV91cmwgfSAvPlxuXHRcdFx0XHRcdFx0PHAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiBzdHJpbmdzLndwZm9ybXNfZW1wdHlfaW5mbyB9fT48L3A+XG5cdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJnZXQtc3RhcnRlZC1idXR0b24gY29tcG9uZW50cy1idXR0b24gaXMtYnV0dG9uIGlzLXByaW1hcnlcIlxuXHRcdFx0XHRcdFx0XHRvbkNsaWNrPXtcblx0XHRcdFx0XHRcdFx0XHQoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvcGVuQnVpbGRlclBvcHVwKCBjbGllbnRJZCApO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHR7IF9fKCAnR2V0IFN0YXJ0ZWQnLCAnd3Bmb3Jtcy1saXRlJyApIH1cblx0XHRcdFx0XHRcdDwvYnV0dG9uPlxuXHRcdFx0XHRcdFx0PHAgY2xhc3NOYW1lPVwiZW1wdHktZGVzY1wiIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogc3RyaW5ncy53cGZvcm1zX2VtcHR5X2hlbHAgfX0+PC9wPlxuXG5cdFx0XHRcdFx0XHR7LyogVGVtcGxhdGUgZm9yIHBvcHVwIHdpdGggYnVpbGRlciBpZnJhbWUgKi99XG5cdFx0XHRcdFx0XHQ8ZGl2IGlkPVwid3Bmb3Jtcy1ndXRlbmJlcmctcG9wdXBcIiBjbGFzc05hbWU9XCJ3cGZvcm1zLWJ1aWxkZXItcG9wdXBcIj5cblx0XHRcdFx0XHRcdFx0PGlmcmFtZSBzcmM9XCJhYm91dDpibGFua1wiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiBpZD1cIndwZm9ybXMtYnVpbGRlci1pZnJhbWVcIj48L2lmcmFtZT5cblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L0ZyYWdtZW50PlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBQcmludCBlbXB0eSBmb3JtcyBub3RpY2UuXG5cdFx0ICpcblx0XHQgKiBAc2luY2UgMS44LjNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBjbGllbnRJZCBCbG9jayBjbGllbnQgSUQuXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7SlNYLkVsZW1lbnR9IEZpZWxkIHN0eWxlcyBKU1ggY29kZS5cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBwcmludEVtcHR5Rm9ybXNOb3RpY2UoIGNsaWVudElkICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0PEluc3BlY3RvckNvbnRyb2xzIGtleT1cIndwZm9ybXMtZ3V0ZW5iZXJnLWZvcm0tc2VsZWN0b3ItaW5zcGVjdG9yLW1haW4tc2V0dGluZ3NcIj5cblx0XHRcdFx0XHQ8UGFuZWxCb2R5IGNsYXNzTmFtZT1cIndwZm9ybXMtZ3V0ZW5iZXJnLXBhbmVsXCIgdGl0bGU9eyBzdHJpbmdzLmZvcm1fc2V0dGluZ3MgfT5cblx0XHRcdFx0XHRcdDxwIGNsYXNzTmFtZT1cIndwZm9ybXMtZ3V0ZW5iZXJnLXBhbmVsLW5vdGljZSB3cGZvcm1zLXdhcm5pbmcgd3Bmb3Jtcy1lbXB0eS1mb3JtLW5vdGljZVwiIHN0eWxlPXt7IGRpc3BsYXk6ICdibG9jaycgfX0+XG5cdFx0XHRcdFx0XHRcdDxzdHJvbmc+eyBfXyggJ1lvdSBoYXZlbuKAmXQgY3JlYXRlZCBhIGZvcm0sIHlldCEnLCAnd3Bmb3Jtcy1saXRlJyApIH08L3N0cm9uZz5cblx0XHRcdFx0XHRcdFx0eyBfXyggJ1doYXQgYXJlIHlvdSB3YWl0aW5nIGZvcj8nLCAnd3Bmb3Jtcy1saXRlJyApIH1cblx0XHRcdFx0XHRcdDwvcD5cblx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImdldC1zdGFydGVkLWJ1dHRvbiBjb21wb25lbnRzLWJ1dHRvbiBpcy1idXR0b24gaXMtc2Vjb25kYXJ5XCJcblx0XHRcdFx0XHRcdFx0b25DbGljaz17XG5cdFx0XHRcdFx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0b3BlbkJ1aWxkZXJQb3B1cCggY2xpZW50SWQgKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0eyBfXyggJ0dldCBTdGFydGVkJywgJ3dwZm9ybXMtbGl0ZScgKSB9XG5cdFx0XHRcdFx0XHQ8L2J1dHRvbj5cblx0XHRcdFx0XHQ8L1BhbmVsQm9keT5cblx0XHRcdFx0PC9JbnNwZWN0b3JDb250cm9scz5cblx0XHRcdCk7XG5cdFx0fVxuXG5cblx0XHRpZiAoICEgaGFzRm9ybXMoKSApIHtcblxuXHRcdFx0anN4ID0gWyBwcmludEVtcHR5Rm9ybXNOb3RpY2UoIHByb3BzLmNsaWVudElkICkgXTtcblxuXHRcdFx0anN4LnB1c2goIGdldEVtcHR5Rm9ybXNQcmV2aWV3KCBwcm9wcyApICk7XG5cdFx0XHRyZXR1cm4ganN4O1xuXHRcdH1cblxuXHRcdGpzeCA9IFtcblx0XHRcdDxJbnNwZWN0b3JDb250cm9scyBrZXk9XCJ3cGZvcm1zLWd1dGVuYmVyZy1mb3JtLXNlbGVjdG9yLWluc3BlY3Rvci1jb250cm9sc1wiPlxuXHRcdFx0XHQ8UGFuZWxCb2R5IHRpdGxlPXsgd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5zdHJpbmdzLmZvcm1fc2V0dGluZ3MgfT5cblx0XHRcdFx0XHQ8U2VsZWN0Q29udHJvbFxuXHRcdFx0XHRcdFx0bGFiZWw9eyB3cGZvcm1zX2d1dGVuYmVyZ19mb3JtX3NlbGVjdG9yLnN0cmluZ3MuZm9ybV9zZWxlY3RlZCB9XG5cdFx0XHRcdFx0XHR2YWx1ZT17IGZvcm1JZCB9XG5cdFx0XHRcdFx0XHRvcHRpb25zPXsgZm9ybU9wdGlvbnMgfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyBzZWxlY3RGb3JtIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDxUb2dnbGVDb250cm9sXG5cdFx0XHRcdFx0XHRsYWJlbD17IHdwZm9ybXNfZ3V0ZW5iZXJnX2Zvcm1fc2VsZWN0b3Iuc3RyaW5ncy5zaG93X3RpdGxlIH1cblx0XHRcdFx0XHRcdGNoZWNrZWQ9eyBkaXNwbGF5VGl0bGUgfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyB0b2dnbGVEaXNwbGF5VGl0bGUgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PFRvZ2dsZUNvbnRyb2xcblx0XHRcdFx0XHRcdGxhYmVsPXsgd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5zdHJpbmdzLnNob3dfZGVzY3JpcHRpb24gfVxuXHRcdFx0XHRcdFx0Y2hlY2tlZD17IGRpc3BsYXlEZXNjIH1cblx0XHRcdFx0XHRcdG9uQ2hhbmdlPXsgdG9nZ2xlRGlzcGxheURlc2MgfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PHAgY2xhc3NOYW1lPVwid3Bmb3Jtcy1ndXRlbmJlcmctcGFuZWwtbm90aWNlXCI+XG5cdFx0XHRcdFx0XHQ8c3Ryb25nPnsgc3RyaW5ncy51cGRhdGVfd3Bfbm90aWNlX2hlYWQgfTwvc3Ryb25nPlxuXHRcdFx0XHRcdFx0eyBzdHJpbmdzLnVwZGF0ZV93cF9ub3RpY2VfdGV4dCB9IDxhIGhyZWY9e3N0cmluZ3MudXBkYXRlX3dwX25vdGljZV9saW5rfSByZWw9XCJub3JlZmVycmVyXCIgdGFyZ2V0PVwiX2JsYW5rXCI+eyBzdHJpbmdzLmxlYXJuX21vcmUgfTwvYT5cblx0XHRcdFx0XHQ8L3A+XG5cblx0XHRcdFx0PC9QYW5lbEJvZHk+XG5cdFx0XHQ8L0luc3BlY3RvckNvbnRyb2xzPixcblx0XHRdO1xuXG5cdFx0aWYgKCBmb3JtSWQgKSB7XG5cdFx0XHRqc3gucHVzaChcblx0XHRcdFx0PFNlcnZlclNpZGVSZW5kZXJcblx0XHRcdFx0XHRrZXk9XCJ3cGZvcm1zLWd1dGVuYmVyZy1mb3JtLXNlbGVjdG9yLXNlcnZlci1zaWRlLXJlbmRlcmVyXCJcblx0XHRcdFx0XHRibG9jaz1cIndwZm9ybXMvZm9ybS1zZWxlY3RvclwiXG5cdFx0XHRcdFx0YXR0cmlidXRlcz17IHByb3BzLmF0dHJpYnV0ZXMgfVxuXHRcdFx0XHQvPlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKCBwcmV2aWV3ICkge1xuXHRcdFx0anN4LnB1c2goXG5cdFx0XHRcdDxGcmFnbWVudFxuXHRcdFx0XHRcdGtleT1cIndwZm9ybXMtZ3V0ZW5iZXJnLWZvcm0tc2VsZWN0b3ItZnJhZ21lbnQtYmxvY2stcHJldmlld1wiPlxuXHRcdFx0XHRcdDxpbWcgc3JjPXsgd3Bmb3Jtc19ndXRlbmJlcmdfZm9ybV9zZWxlY3Rvci5ibG9ja19wcmV2aWV3X3VybCB9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScgfX0vPlxuXHRcdFx0XHQ8L0ZyYWdtZW50PlxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0anN4LnB1c2goXG5cdFx0XHRcdDxQbGFjZWhvbGRlclxuXHRcdFx0XHRcdGtleT1cIndwZm9ybXMtZ3V0ZW5iZXJnLWZvcm0tc2VsZWN0b3Itd3JhcFwiXG5cdFx0XHRcdFx0Y2xhc3NOYW1lPVwid3Bmb3Jtcy1ndXRlbmJlcmctZm9ybS1zZWxlY3Rvci13cmFwXCI+XG5cdFx0XHRcdFx0PGltZyBzcmM9eyB3cGZvcm1zX2d1dGVuYmVyZ19mb3JtX3NlbGVjdG9yLmxvZ29fdXJsIH0vPlxuXHRcdFx0XHRcdDxoMz57IHdwZm9ybXNfZ3V0ZW5iZXJnX2Zvcm1fc2VsZWN0b3Iuc3RyaW5ncy50aXRsZSB9PC9oMz5cblx0XHRcdFx0XHQ8U2VsZWN0Q29udHJvbFxuXHRcdFx0XHRcdFx0a2V5PVwid3Bmb3Jtcy1ndXRlbmJlcmctZm9ybS1zZWxlY3Rvci1zZWxlY3QtY29udHJvbFwiXG5cdFx0XHRcdFx0XHR2YWx1ZT17IGZvcm1JZCB9XG5cdFx0XHRcdFx0XHRvcHRpb25zPXsgZm9ybU9wdGlvbnMgfVxuXHRcdFx0XHRcdFx0b25DaGFuZ2U9eyBzZWxlY3RGb3JtIH1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L1BsYWNlaG9sZGVyPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ganN4O1xuXHR9LFxuXHRzYXZlKCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9LFxufSApO1xuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUVBLFlBQVk7O0FBRVosSUFBQUEsR0FBQSxHQUFnRkMsRUFBRTtFQUFBQyxvQkFBQSxHQUFBRixHQUFBLENBQTFFRyxnQkFBZ0I7RUFBRUMsZ0JBQWdCLEdBQUFGLG9CQUFBLGNBQUdELEVBQUUsQ0FBQ0ksVUFBVSxDQUFDRCxnQkFBZ0IsR0FBQUYsb0JBQUE7QUFDM0UsSUFBQUksV0FBQSxHQUFvQ0wsRUFBRSxDQUFDTSxPQUFPO0VBQXRDQyxhQUFhLEdBQUFGLFdBQUEsQ0FBYkUsYUFBYTtFQUFFQyxRQUFRLEdBQUFILFdBQUEsQ0FBUkcsUUFBUTtBQUMvQixJQUFRQyxpQkFBaUIsR0FBS1QsRUFBRSxDQUFDVSxNQUFNLENBQS9CRCxpQkFBaUI7QUFDekIsSUFBQUUsSUFBQSxHQUE4QlgsRUFBRSxDQUFDWSxXQUFXLElBQUlaLEVBQUUsQ0FBQ2Es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
},{}]},{},[1])