/**
 *
 * create by liangguodong on 2018/12/5
 *
 * @flow
 */
import * as React from 'react';
import Tooltip from '../tooltip/index';
import Icon from '../icon/index';
import Widget from '../consts/index';
import type { PopoverProps, PopoverState } from '../css/popover';
import { getStateFromProps, processOnVisibleChange } from '../tooltip';
import ThemeHoc from '@lugia/theme-hoc';
import { deepMerge } from '@lugia/object-utils';
import { css, StaticComponent } from '@lugia/theme-css-hoc';
import { units } from '@lugia/css';
const { px2remcss } = units;
const mediumGreyColor = '$lugia-dict.@lugia/lugia-web.mediumGreyColor';
const darkGreyColor = '$lugia-dict.@lugia/lugia-web.darkGreyColor';
const xsFontSize = '$lugia-dict.@lugia/lugia-web.xsFontSize';
const blackColor = '$lugia-dict.@lugia/lugia-web.blackColor';

const ClearContainer: Object = StaticComponent({
  tag: 'div',
  className: 'PopoverIconContainer',
  normal: {
    selectNames: [],
  },
  css: css`
    position: absolute;
    right: ${px2remcss(8)};
    top: ${px2remcss(8)};
  `,
});

class Popover extends React.Component<PopoverProps, PopoverState> {
  static displayName = Widget.Popover;
  static defaultProps = {
    defaultVisible: false,
    action: ['click'],
    showClearButton: false,
  };
  target: Object;

  constructor(props: PopoverProps) {
    super(props);
  }

  static getDerivedStateFromProps(props: PopoverProps, state: PopoverState) {
    return getStateFromProps(props, state);
  }

  onClearClick = e => {
    const { onClearClick } = this.props;
    this.setState({ visible: false });
    onClearClick && onClearClick(e);
  };

  getContent() {
    const { content } = this.props;
    return (
      <div>
        {content}
        {this.getCloseContainer()}
      </div>
    );
  }
  getCloseContainer(): React.Node | null {
    const { clearIcon = 'lugia-icon-reminder_close', showClearButton } = this.props;

    const { theme: IconThemeProps, viewClass: IconViewClass } = this.props.getPartOfThemeHocProps(
      'PopoverClearIcon'
    );

    const iconTheme = deepMerge(
      {
        [IconViewClass]: {
          normal: {
            color: mediumGreyColor,
            cursor: 'pointer',
            fontSize: xsFontSize,
          },
          hover: {
            color: darkGreyColor,
          },
        },
      },
      IconThemeProps
    );

    return showClearButton ? (
      <ClearContainer onClick={this.onClearClick}>
        <Icon theme={iconTheme} viewClass={IconViewClass} iconClass={clearIcon} singleTheme />
      </ClearContainer>
    ) : null;
  }

  getTitle(): React.Node | null {
    const { title } = this.props;
    return title;
  }

  getDescription(): React.Node | null {
    const { description } = this.props;
    return description ? description : null;
  }

  render() {
    const {
      children = <div />,
      action,
      placement,
      alwaysOpen,
      liquidLayout,
      createPortal = true,
      popArrowType = 'sharp',
      popupContainerId,
      getPopTargetDom,
    } = this.props;
    const { visible } = this.state;
    const getTarget: Function = cmp => (this.target = cmp);

    const { theme: theTheme, viewClass } = this.props.getPartOfThemeHocProps('PopoverContent');

    const tooltipTheme = deepMerge(
      {
        [viewClass]: {
          Container: {
            normal: {
              background: {
                color: 'white',
              },
              padding: 8,
              fontSize: 12,
            },
            hover: {
              background: {
                color: 'white',
              },
            },
          },
          TooltipTitle: {
            normal: {
              color: blackColor,
              fontSize: 14,
            },
          },
          TooltipDescription: {
            normal: {
              color: darkGreyColor,
              fontSize: 12,
            },
          },
        },
      },
      theTheme
    );
    return (
      <Tooltip
        popupContainerId={popupContainerId}
        createPortal={createPortal}
        alwaysOpen={alwaysOpen}
        liquidLayout={liquidLayout}
        theme={tooltipTheme}
        viewClass={viewClass}
        visible={visible}
        action={action}
        onVisibleChange={this.onVisibleChange}
        placement={placement}
        content={this.getContent()}
        title={this.getTitle()}
        description={this.getDescription()}
        ref={getTarget}
        getPopTargetDom={getPopTargetDom}
        popArrowType={popArrowType}
      >
        {children}
      </Tooltip>
    );
  }

  onVisibleChange = (visible: boolean) => {
    processOnVisibleChange.call(this, visible);
  };
}

export default ThemeHoc(Popover, Widget.Popover, {
  hover: true,
  active: true,
});
