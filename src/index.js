'use strict';

import React, { Component, } from 'react';
var tweenState = require('react-tween-state');

import {
  Image,
  StyleSheet,
  TouchableHighlight,
  View
} from 'react-native';

var styles = require('./styles');
var images = require('./images');

var SPIN_DURATION = 1000;

var ProgressHUDMixin = {
  getInitialState() {
    return {
      is_hud_visible: false,
    };
  },

  showProgressHUD() {
    this.setState({
      is_hud_visible: true,
    });
  },

  dismissProgressHUD() {
    this.setState({
      is_hud_visible: false,
    });
  },

  childContextTypes: {
    showProgressHUD: React.PropTypes.func,
    dismissProgressHUD: React.PropTypes.func,
  },

  getChildContext() {
    return {
      showProgressHUD: this.showProgressHUD,
      dismissProgressHUD: this.dismissProgressHUD,
    };
  },
};

var ProgressHUDHOC = (Component) => React.createClass({
  mixins: [ProgressHUD.Mixin],
  render() {
    return (
      <Component {...this.props}
        hudVisible={this.state.is_hud_visible}
        showProgressHUD={this.showProgressHUD}
        dismissProgressHUD={this.dismissProgressHUD} />
    );
  },
});

var ProgressHUD = React.createClass({
  mixins: [tweenState.Mixin],

  contextTypes: {
    showProgressHUD: React.PropTypes.func,
    dismissProgressHUD: React.PropTypes.func,
  },

  statics: {
    Mixin: ProgressHUDMixin,
    HOC: ProgressHUDHOC,
  },

  propTypes: {
    isDismissible: React.PropTypes.bool,
    isVisible: React.PropTypes.bool.isRequired,
    color: React.PropTypes.string,
    overlayColor: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      isDismissible: false,
      backgroundColor: 'white',
      color: '#000',
      overlayColor: 'rgba(0, 0, 0, 0)'
    };
  },

  getInitialState() {
    return {
      rotate_deg: 0
    };
  },

  componentDidMount() {
    // Kick off rotation animation
    this._rotateSpinner();

    // Set rotation interval
    this.interval = setInterval(() => {
      this._rotateSpinner();
    }, SPIN_DURATION);
  },

  componentWillUnmount() {
    clearInterval(this.interval);
  },

  _rotateSpinner() {
    this.tweenState('rotate_deg', {
      easing: tweenState.easingTypes.linear,
      duration: SPIN_DURATION,
      endValue: this.state.rotate_deg === 0 ? 360 : this.state.rotate_deg + 360,
    });
  },

  _clickHandler() {
    if (this.props.isDismissible && this.context.dismissProgressHUD) {
      this.context.dismissProgressHUD();
    }
  },

  render() {
    // Return early if not visible
    if (!this.props.isVisible) {
      return <View />;
    }

    // Set rotation property value
    var deg = Math.floor(
      this.getTweeningValue('rotate_deg')
    ).toString() + 'deg';

    return (
      /*jshint ignore:start */
      <TouchableHighlight
        key="ProgressHUD"
        style={[styles.overlay, {
          backgroundColor: this.props.overlayColor,
        }]}
        onPress={this._clickHandler}
        underlayColor={this.props.overlayColor}
        activeOpacity={1}
      >
        <View
          style={[styles.container, {
            backgroundColor: this.props.backgroundColor,
            left: this.getTweeningValue('left'),
          }]}
        >
          <Image
            style={[styles.spinner, {
              backgroundColor: this.props.color,
              transform: [
                { rotate: deg },
            ],
            }]}
            source={{
              uri: 'data:image/png;base64,' + images['1x'],
              isStatic: true,
            }}
          >
            <View style={[styles.inner_spinner, {
              backgroundColor: this.props.backgroundColor,
            }]}>
            </View>
          </Image>
        </View>
      </TouchableHighlight>
      /*jshint ignore:end */
    );
  },
});


module.exports = ProgressHUD;
