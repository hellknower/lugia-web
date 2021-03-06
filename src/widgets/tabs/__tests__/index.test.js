/**
 *
 * create by ligx
 *
 * @flow
 */
import React from 'react';
import renderer from 'react-test-renderer';
import 'jest-styled-components';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Tabs, { hasTargetInProps, getDefaultData } from '../tabs';
import { hasActivityValueData, defaultData, shortChildren, longChildren } from '../demo';
import Tabpane from '../tabpane';

Enzyme.configure({ adapter: new Adapter() });

describe('tabsDemo', () => {
  const themeProps = { themeConfig: {}, themeState: {} };
  const getPartOfThemeProps = () => true;
  const createTabs = (obj?: Object): any => {
    const config = obj || {
      activityValue: 0,
      tabType: 'line',
      tabPosition: 'bottom',
      data: hasActivityValueData,
    };
    return (
      <Tabs
        {...config}
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        themeProps={themeProps}
      />
    );
  };
  it('Component JSON', () => {
    const target = (
      <Tabs
        getPartOfThemeProps={getPartOfThemeProps}
        getPartOfThemeHocProps={getPartOfThemeProps}
        themeProps={themeProps}
      />
    );
    expect(renderer.create(target).toJSON()).toMatchSnapshot();
  });
  const getCmp = (target: any): Object => {
    return target.children().instance();
  };

  it('props hasTargetInProps', () => {
    expect(
      hasTargetInProps('data', {
        data: [{ title: 'zbc' }],
        getPartOfThemeProps,
        getPartOfThemeHocProps: getPartOfThemeProps,
        themeProps,
      })
    ).toBe(true);
    expect(
      hasTargetInProps('children', {
        children: <div>123</div>,
        getPartOfThemeProps,
        getPartOfThemeHocProps: getPartOfThemeProps,
        themeProps,
      })
    ).toBe(true);
    expect(
      hasTargetInProps('ops', {
        ops: 'sdfsdf',
        getPartOfThemeProps,
        getPartOfThemeHocProps: getPartOfThemeProps,
        themeProps,
      })
    ).toBe(true);
    expect(
      hasTargetInProps('ads', {
        ops: 'sdfsdf',
        getPartOfThemeProps,
        getPartOfThemeHocProps: getPartOfThemeProps,
        themeProps,
      })
    ).toBe(false);
  });

  it('props defaultActivityValue', () => {
    const target = mount(createTabs({ defaultActivityValue: '2', data: hasActivityValueData }));
    const { activityValue } = getCmp(target).state;
    expect(activityValue).toBe('2');
  });
  it('props activityValue', () => {
    const target = mount(createTabs({ activityValue: '2', data: hasActivityValueData }));
    const { activityValue } = getCmp(target).state;
    expect(activityValue).toBe('2');
  });
  it('props defaultData', () => {
    const target = mount(createTabs({ defaultData }));
    const { data } = getCmp(target).state;
    expect(data).toEqual(data);
  });
  it('props data', () => {
    const target = mount(createTabs({ data: hasActivityValueData, tabPosition: 'left' }));
    const { data } = getCmp(target).state;
    expect(data).toEqual(hasActivityValueData);
  });
  it('props data && defaultData', () => {
    const target = mount(createTabs({ data: hasActivityValueData, defaultData }));
    const { data } = getCmp(target).state;
    expect(data).toEqual(hasActivityValueData);
  });
  it('props data []', () => {
    const target = mount(createTabs({ data: [] }));
    const { data } = getCmp(target).state;
    expect(data).toEqual([]);
  });
  it('props children shortChildren', () => {
    const target = mount(createTabs({ children: shortChildren }));
    const { activityValue } = getCmp(target).state;
    expect(activityValue).toBe('Tab1');
  });
  it('props children longChildren', () => {
    const target = mount(createTabs({ children: longChildren }));
    const { activityValue } = getCmp(target).state;
    expect(activityValue).toBe('Tab1');
  });
  it('props children&&data', () => {
    const target = mount(createTabs({ data: hasActivityValueData, children: shortChildren }));
    const { activityValue } = getCmp(target).state;
    expect(activityValue).toBe('0');
  });

  function testActivityValue(component: any, expActicityValue: string) {
    it('props activityValue', () => {
      const target = mount(component);
      const type = 'Tabpane';
      const tabpane = target.find(type);
      tabpane.at(2).simulate('click');
      expect(getCmp(target).state.activityValue).toBe(expActicityValue);
    });
  }
  testActivityValue(createTabs({ data: hasActivityValueData, activityValue: '1' }), '1');
  testActivityValue(createTabs({ data: hasActivityValueData, activityValue: '3' }), '3');

  it('props onAddClick 非受限', async () => {
    const target = mount(
      <Tabs
        tabType="card"
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        themeProps={themeProps}
      />
    );
    expect(getCmp(target).state.data).toEqual([
      { title: 'Tab1', value: 'Tab1' },
      { title: 'Tab2', value: 'Tab2' },
      { title: 'Tab3', value: 'Tab3' },
    ]);
    target
      .children()
      .instance()
      .onAddClick();
    expect(getCmp(target).state.data).toEqual([
      { title: 'Tab1', value: 'Tab1' },
      { title: 'Tab2', value: 'Tab2' },
      { title: 'Tab3', value: 'Tab3' },
      { title: 'Tab4', content: 'Tab4 Content', value: 'Tab4' },
    ]);
  });

  it('props onAddClick 受限', async () => {
    const target = mount(createTabs());
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
    target
      .children()
      .instance()
      .onAddClick();
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
  });

  it('props onDelete 非受限', async () => {
    const target = mount(
      <Tabs
        tabType="card"
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        themeProps={themeProps}
      />
    );
    expect(getCmp(target).state.data).toEqual([
      { title: 'Tab1', value: 'Tab1' },
      { title: 'Tab2', value: 'Tab2' },
      { title: 'Tab3', value: 'Tab3' },
    ]);
    target
      .children()
      .instance()
      .onDelete({ index: 1, activityValue: 'Tab2' });
    expect(getCmp(target).state.data).toEqual([
      { title: 'Tab1', value: 'Tab1' },
      { title: 'Tab3', value: 'Tab3' },
    ]);
  });

  it('props onDelete 受限', async () => {
    const target = mount(createTabs());
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
    target
      .children()
      .instance()
      .onDelete(2);
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
  });

  it('props onChange 非受限', async () => {
    const target = mount(
      <Tabs
        tabType="card"
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        themeProps={themeProps}
      />
    );
    expect(getCmp(target).state.activityValue).toEqual('Tab1');
    target
      .children()
      .instance()
      .onChange({ index: 1, activityValue: 'Tab2' });
    expect(getCmp(target).state.activityValue).toEqual('Tab2');
  });

  it('props onChange 受限', async () => {
    const target = mount(createTabs());
    expect(getCmp(target).state.activityValue).toEqual('0');
    target
      .children()
      .instance()
      .onChange({ index: 2, activityValue: 'Tab3' });
    expect(getCmp(target).state.activityValue).toEqual('0');
  });

  it('props onAddClick 非受限', async () => {
    const target = mount(
      <Tabs
        tabType="card"
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        themeProps={themeProps}
      />
    );

    expect(getCmp(target).state.data).toEqual(getDefaultData({}));
    expect(getCmp(target).state.activityValue).toEqual('Tab1');
    target
      .children()
      .instance()
      .onAddClick();
    expect(getCmp(target).state.data).toEqual([
      { title: 'Tab1', value: 'Tab1' },
      { title: 'Tab2', value: 'Tab2' },
      { title: 'Tab3', value: 'Tab3' },
      { title: 'Tab4', content: 'Tab4 Content', value: 'Tab4' },
    ]);
    expect(getCmp(target).state.activityValue).toEqual('Tab4');
  });

  it('props onAddClick 受限', async () => {
    const target = mount(createTabs());
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
    expect(getCmp(target).state.activityValue).toEqual('0');
    target
      .children()
      .instance()
      .onAddClick();
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
    expect(getCmp(target).state.activityValue).toEqual('0');
  });

  it('props 受限 data', async () => {
    const target = mount(
      <Tabs
        data={hasActivityValueData}
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        themeProps={themeProps}
      />
    );
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
    getCmp(target).setState({ data: [] });
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
    target.setProps({ data: [] });
    expect(getCmp(target).state.data).toEqual([]);
    target.setProps({ data: hasActivityValueData });
    expect(getCmp(target).state.data).toEqual(hasActivityValueData);
  });

  it('props hideTabBar', () => {
    const target = mount(
      <Tabs
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        hideTabBar={true}
      />
    );
    expect(getCmp(target).props.hideTabBar).toBe(true);
  });

  it('props isShowArrowIcon', () => {
    const target = mount(
      <Tabs
        getPartOfThemeHocProps={getPartOfThemeProps}
        getPartOfThemeProps={getPartOfThemeProps}
        isShowArrowIcon={false}
      />
    );
    expect(getCmp(target).props.isShowArrowIcon).toBe(false);
  });

  it('getCurrentPageByActivityValue', async () => {
    const target = mount(createTabs());
    const mockInfo = [
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '1',
        totalPage: 4,
        exception: 1,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '2',
        totalPage: 4,
        exception: 1,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '3',
        totalPage: 4,
        exception: 1,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '4',
        totalPage: 4,
        exception: 2,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '5',
        totalPage: 4,
        exception: 2,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '6',
        totalPage: 4,
        exception: 2,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '7',
        totalPage: 4,
        exception: 3,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '8',
        totalPage: 4,
        exception: 3,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '9',
        totalPage: 4,
        exception: 3,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
        ],
        activityValue: '10',
        totalPage: 4,
        exception: 4,
      },
      {
        data: [
          { value: '1' },
          { value: '2' },
          { value: '3' },
          { value: '4' },
          { value: '5' },
          { value: '6' },
          { value: '7' },
          { value: '8' },
          { value: '9' },
          { value: '10' },
          { value: '11' },
          { value: '12' },
          { value: '13' },
          { value: '14' },
          { value: '15' },
        ],
        activityValue: '7',
        totalPage: 4,
        exception: 2,
      },
    ];
    mockInfo.forEach(item => {
      const { exception, data, activityValue, totalPage } = item;
      const tabHeader = target.find('TabHeader');
      const res = tabHeader
        .instance()
        .getCurrentPageByActivityValue(data, activityValue, totalPage);
      expect(res).toEqual(exception);
    });
  });
});
