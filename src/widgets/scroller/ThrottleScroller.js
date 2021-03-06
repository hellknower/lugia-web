/**
 * 节流滚动HOC
 * create by ligx
 *
 * @flow
 */
import * as React from 'react';
import Scroller from './index';
import Widget from '../consts/index';
import { getBoxShadow } from '@lugia/theme-utils';
import { deepMerge } from '@lugia/object-utils';
import { DefaultHeight, ScrollerContainer, Col, ScrollerCol } from '../css/scroller';
import { getCanSeeCount, getCanRenderCompleteCount } from './support';
import { getBorderRadius } from '../theme/CSSProvider';
import get from '../css/theme-common-dict';
type ThrottleScrollerState = {
  start: number,
};
const EVENTS_TO_MODIFY = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel'];

const originalAddEventListener = window.addEventListener.bind();

document.addEventListener = (type, listener, options, wantsUntrusted) => {
  let modOptions = options;
  if (EVENTS_TO_MODIFY.includes(type)) {
    if (typeof options === 'boolean') {
      modOptions = {
        capture: options,
        passive: false,
      };
    } else if (typeof options === 'object') {
      modOptions = {
        passive: false,
        ...options,
      };
    }
  }

  return originalAddEventListener(type, listener, modOptions, wantsUntrusted);
};

const originalRemoveEventListener = window.removeEventListener.bind();
document.removeEventListener = (type, listener, options) => {
  let modOptions = options;
  if (EVENTS_TO_MODIFY.includes(type)) {
    if (typeof options === 'boolean') {
      modOptions = {
        capture: options,
        passive: false,
      };
    } else if (typeof options === 'object') {
      modOptions = {
        passive: false,
        ...options,
      };
    }
  }
  return originalRemoveEventListener(type, listener, modOptions);
};

export default (
  Target: React.ComponentType<any>,
  MenuItemHeight: number,
  TargetWrapName: string,
  TargetItemNames: string[]
) => {
  return class ThrottleScroller extends React.Component<any, ThrottleScrollerState> {
    static displayName = Widget.ThrottleScroller;
    static defaultProps = {
      mutliple: false,
    };
    scroller: ?Object;
    scrollerTarget: ?Object;

    itemHeight: number;
    viewSize: number;
    isDrag: boolean;

    constructor(props: any) {
      super(props);
      this.state = {
        start: 0,
      };
      this.itemHeight = this.getActiveItemHeight(props);
      this.scrollerTarget = React.createRef();
      this.viewSize = this.fetchViewSize();
      this.marginBottom = this.getItemMarginBottom();
    }

    shouldComponentUpdate(nextProps, nextState) {
      this.itemHeight = this.getActiveItemHeight(nextProps);
      return true;
    }

    componentWillUpdate() {
      this.viewSize = this.fetchViewSize();
    }

    getItemWrapThemeConfig = () => {
      const { getPartOfThemeConfig } = this.props;
      const ItemName = TargetItemNames[0];
      const ItemWrapName = TargetItemNames[1];
      const themeConfig = getPartOfThemeConfig(ItemName);
      return themeConfig[ItemWrapName] ? themeConfig[ItemWrapName] : {};
    };

    getItemMarginBottom() {
      const { normal: { margin: { bottom = 0 } = {} } = {} } = this.getItemWrapThemeConfig();
      return isNaN(bottom) ? 0 : bottom;
    }

    getActiveItemHeight = (props: Object) => {
      const { normal: { height } = {} } = this.getItemWrapThemeConfig();
      return height || props.menuItemHeight || MenuItemHeight;
    };

    getContainerThemeProps(target: string, params: Object) {
      const themeProps = this.props.getPartOfThemeProps(target, params);
      const { themeConfig = {} } = themeProps;
      const defaultTheme = {
        boxShadow: get('normalBoxShadow'),
        borderRadius: getBorderRadius(get('borderRadiusValue')),
      };
      themeConfig.normal = deepMerge(defaultTheme, themeConfig.normal);
      return themeProps;
    }

    getDefaultHeight() {
      const { defaultHeight } = this.props;
      return isNaN(defaultHeight) ? DefaultHeight : Number(defaultHeight);
    }

    getActiveAutoHeight() {
      const { data = [], autoHeight = false, getPartOfThemeProps } = this.props;
      const { themeConfig: { normal: { height } = {} } = {} } = getPartOfThemeProps(TargetWrapName);

      if (!data || data.length === 0) {
        return false;
      }
      return autoHeight
        ? autoHeight
        : this.itemHeight * data.length <= this.getDefaultHeight() && !height
        ? true
        : false;
    }

    render() {
      const { props } = this;
      const start = this.getStart(props, this.state);
      const { level, autoHeight = false, __virtual = true } = props;
      const activeAutoHeight = this.getActiveAutoHeight();
      const totalSize = this.fetchTotalSize(activeAutoHeight);
      const defaultHeight = this.getDefaultHeight();
      const themeProps = this.getContainerThemeProps(TargetWrapName, {
        props: {
          isDrag: this.isDrag,
          autoHeight: activeAutoHeight,
          totalSize,
          defaultHeight,
          __virtual,
        },
      });

      const pack = (element: Object | Array<Object>) => {
        return (
          <ScrollerContainer
            themeProps={themeProps}
            onWheel={activeAutoHeight || !__virtual ? undefined : this.onWheel}
          >
            {element}
          </ScrollerContainer>
        );
      };

      if (!this.isNeedScroller() || autoHeight || !__virtual) {
        const { length } = this.getTarget();
        //TODO: 待测试
        return pack(
          <Target
            {...props}
            autoHeight={activeAutoHeight}
            start={0}
            end={length}
            canSeeCount={length}
            itemHeight={this.itemHeight}
            ref={this.scrollerTarget}
            defaultHeight={this.getDefaultHeight()}
            marginBottom={this.marginBottom}
          />
        );
      }

      const { type, step } = props;

      const end = this.fetchEnd(start);
      const canSeeCount = this.canSeeCount();

      return pack([
        <Col themeProps={themeProps} level={level}>
          <Target
            {...props}
            autoHeight={activeAutoHeight}
            canSeeCount={canSeeCount}
            start={start}
            end={end}
            itemHeight={this.itemHeight}
            ref={this.scrollerTarget}
            defaultHeight={this.getDefaultHeight()}
            marginBottom={this.marginBottom}
          />
        </Col>,
        <ScrollerCol level={level} themeProps={themeProps} isDrag={this.isDrag}>
          <Scroller
            ref={cmp => (this.scroller = cmp)}
            type={type}
            onDrag={this.onDrag}
            value={this.itemHeight * start}
            viewSize={this.viewSize}
            totalSize={totalSize}
            onChange={this.onScroller}
            step={step}
          />
        </ScrollerCol>,
      ]);
    }

    onDrag = (drag: boolean) => {
      this.isDrag = drag;
    };

    getStart(props: Object, state: Object): number {
      const { length } = this.getTarget();

      const limitStart = (start: number) => {
        const maxStart = Math.max(0, length - this.canSeeCount() + 1);
        return Math.min(start, maxStart);
      };

      if ('start' in props) {
        const { start = 0 } = props;
        return limitStart(start);
      }

      const { start = 0 } = state;
      return limitStart(start);
    }

    isNeedScroller() {
      const { length } = this.getTarget();
      return this.canRendCompleteCount() < length;
    }

    canSeeCount(): number {
      return getCanSeeCount(this.viewSize, this.itemHeight);
    }

    canRendCompleteCount(): number {
      return getCanRenderCompleteCount(this.viewSize, this.itemHeight);
    }

    fetchViewSize = () => {
      const { autoHeight = false, getPartOfThemeConfig } = this.props;
      const { normal = {} } = getPartOfThemeConfig(TargetWrapName);
      let { height } = normal;
      height = !height && height !== 0 ? this.getDefaultHeight() : height;
      let { data } = this.props;
      if (!data || data === null) {
        data = [];
      }
      const { padding: { top = 0, bottom = 0 } = {} } = normal;
      const allItemHeight = this.itemHeight * data.length + top + bottom;
      return autoHeight ? allItemHeight : height;
    };

    fetchTotalSize(autoHeight: boolean): number {
      const { length } = this.getTarget();
      let remainder;
      if (this.viewSize % this.itemHeight === 0 || autoHeight) {
        remainder = 0;
      } else {
        remainder = this.viewSize % this.itemHeight;
      }
      const {
        normal: { padding: { top = 0, bottom = 0 } = {} } = {},
      } = this.props.getPartOfThemeConfig(TargetWrapName);

      return length * this.itemHeight + remainder + top + bottom + length * this.marginBottom;
    }

    getTarget(): Array<any> {
      const { data, children } = this.props;
      if (!data && !children) {
        return [];
      }
      return data ? data : children;
    }

    fetchEnd(start: number): number {
      const { length: maxLen } = this.getTarget();
      if (maxLen === 0) {
        return 0;
      }
      const seeCount = this.canSeeCount();

      return Math.min(seeCount + Math.max(start, 0), maxLen);
    }

    onWheel = (e: Object) => {
      if (this.isNeedScroller()) {
        e.stopPropagation();
        e.preventDefault();
      }
      this.scroller && this.scroller.onWheel && this.scroller.onWheel.call(this.scroller, e);
    };

    onScroller = (value: number) => {
      const { onScroller } = this.props;
      const start = value / this.itemHeight;
      onScroller ? onScroller(start, this.fetchEnd(start)) : this.setState({ start });
    };
  };
};
