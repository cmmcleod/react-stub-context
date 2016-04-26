jest.dontMock('../');

describe('createStubbedContextcomponent', function() {
  var CompareVersions, React, ReactDOM, TestUtils, TestComponent, createStubbedContextComponent;

  function getInternalContext(component) {
    if (CompareVersions(React.version, '0.13.3')) {
      return component._owner._renderedComponent._context
    } else {
      return component._context
    }
  }

  beforeEach(function() {
    CompareVersions = require.requireActual('compare-versions');
    React = require.requireActual('react');
    ReactDOM = require.requireActual('react-dom');
    TestUtils = require.requireActual('react-addons-test-utils');
    TestComponent = React.createClass({ render: function() { return null; }});
    createStubbedContextComponent = require('../');
  })

  it('requires an object', function() {
    expect(function() {
      createStubbedContextComponent(TestComponent, 1989);
    }).toThrow();

    expect(function() {
      createStubbedContextComponent(TestComponent, 'test');
    }).toThrow();
  });

  it('returns a component constructor', function() {
    var StubbedContextComponent = createStubbedContextComponent(TestComponent, {});
    var isCompositeComponent = TestUtils.isCompositeComponent(StubbedContextComponent.prototype)
    expect(isCompositeComponent).toEqual(true);
  });

  it('Sets child context types on component', function() {
    var StubbedContextComponent = createStubbedContextComponent(TestComponent, { taylor: 'swift' });
    expect(StubbedContextComponent.childContextTypes.taylor).toBeDefined();
  });

  it('Sets context types on target component correctly', function() {
    var StubbedContextComponent = createStubbedContextComponent(TestComponent, { taylor: 'swift' });
    expect(StubbedContextComponent.getWrappedComponent().contextTypes.taylor).toBeDefined();
  });

  it('Merges with existing context types on component', function() {
    TestComponent = React.createClass({
      contextTypes: { bad: React.PropTypes.string },
      render: function() { return null }
    });

    var StubbedContextComponent = createStubbedContextComponent(TestComponent, { taylor: 'swift' });
    var stubbedContextComponentElement = TestUtils.renderIntoDocument(<StubbedContextComponent />);
    expect(StubbedContextComponent.getWrappedComponent().contextTypes.taylor).toBeDefined();
    expect(StubbedContextComponent.getWrappedComponent().contextTypes.bad).toBeDefined();
  });


  it('Assigns parent and owner contexts correctly', function() {
    var StubbedContextComponent = createStubbedContextComponent(TestComponent, { taylor: 'swift' });
    var stubbedContextComponentElement = TestUtils.renderIntoDocument(<StubbedContextComponent />);

    expect(getInternalContext(stubbedContextComponentElement.getWrappedElement()).taylor).toEqual('swift');
    expect(getInternalContext(stubbedContextComponentElement.getWrappedParentElement()).taylor).toEqual('swift');
  });

  it('Hooks up context on target component correctly', function() {
    TestComponent = React.createClass({
      render: function() {
        return <span>{this.context.taylor}</span>;
      }
    });

    var StubbedContextComponent = createStubbedContextComponent(TestComponent, { taylor: 'swift' });
    var stubbedContextComponentElement = TestUtils.renderIntoDocument(<StubbedContextComponent />);

    expect(getInternalContext(stubbedContextComponentElement.getWrappedElement()).taylor).toEqual('swift');
    expect(ReactDOM.findDOMNode(stubbedContextComponentElement).innerHTML).toEqual('swift');
  });

  it('Passes through props to target component correctly', function() {
    TestComponent = React.createClass({
      render: function() {
        return <span>{this.props.red}</span>;
      }
    });

    var StubbedContextComponent = createStubbedContextComponent(TestComponent);
    var stubbedContextComponentElement = TestUtils.renderIntoDocument(<StubbedContextComponent red="Fearless" />);

    expect(ReactDOM.findDOMNode(stubbedContextComponentElement).innerHTML).toEqual('Fearless');
  })
});
