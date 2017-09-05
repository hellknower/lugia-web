/*
 * 遮罩盒子
 * @flow
 */
import * as React from 'react';
import VisibleBox from '../common/VisibleBox';

export const ZIndex = 1050;
export default VisibleBox.extend`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: #373737;
  background-color: rgba(55, 55, 55, 0.6);
  height: 100%;
  filter: alpha(opacity=50);
  z-index: ${ZIndex};
`;
