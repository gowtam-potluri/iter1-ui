import React from 'react';
import URLSearchParams from 'url-search-params';
import { Route } from 'react-router-dom';
import { Panel } from 'react-bootstrap';
import IssueFilter from './PatIssueFilter.jsx';
import IssueTable from './PatIssueTable.jsx';

import IssueDetail from './PatIssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';

export default class IssueList extends React.Component {
  constructor() {
    super();
    this.state = {
      issues: [],
      toastVisible: false,
      toastMessage: '',
      toastType: 'info',
    };

   
    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { location: { search: prevSearch } } = prevProps;
    const { location: { search } } = this.props;
    if (prevSearch !== search) {
      this.loadData();
    }
  }

  async loadData() {
    const { location: { search } } = this.props;
    const params = new URLSearchParams(search);
    const vars = {};
    if (params.get('helpreq')) vars.helpreq = params.get('helpreq');

    const effortMin = parseInt(params.get('effortMin'), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get('effortMax'), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;

    const query = `query patList(
      $helpreq: AvailableType
      $effortMin: Int
      $effortMax: Int
    ) {
      patList(
        helpreq: $helpreq
        effortMin: $effortMin
        effortMax: $effortMax
      ) {
        id district helpreq name
        created quantity phone
      }
    }`;

    const data = await graphQLFetch(query, vars, this.showError);
    if (data) {
      this.setState({ issues: data.patList });
    }
  }

  

  async closeIssue(index) {
    const query = `mutation patissueClose($id: Int!) {
      patissueUpdate(id: $id, changes: { helpreq: False }) {
        id district helpreq name
        quantity created phone description
      }
    }`;
    const { issues } = this.state;
    const data = await graphQLFetch(query, { id: issues[index].id },
      this.showError);
    if (data) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        newList[index] = data.patissueUpdate;
        return { issues: newList };
      });
    } else {
      this.loadData();
    }
  }

  async deleteIssue(index) {
    const query = `mutation patissueDelete($id: Int!) {
      patissueDelete(id: $id)
    }`;
    const { issues } = this.state;
    const { location: { pathname, search }, history } = this.props;
    const { id } = issues[index];
    const data = await graphQLFetch(query, { id }, this.showError);
    if (data && data.patissueDelete) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        if (pathname === `/patient/${id}`) {
          history.push({ pathname: '/patient', search });
        }
        newList.splice(index, 1);
        return { issues: newList };
      });
      this.showSuccess(`Deleted issue ${id} successfully.`);
    } else {
      this.loadData();
    }
  }
  showSuccess(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'success',
    });
  }

  showError(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({ toastVisible: false });
  }
  render() {
    const { issues } = this.state;
    const { toastVisible, toastType, toastMessage } = this.state;
    const { match } = this.props;
    return (
      <React.Fragment>

<Panel>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter />
          </Panel.Body>
        </Panel>
        <IssueTable
          issues={issues}
          closeIssue={this.closeIssue}
          deleteIssue={this.deleteIssue}
        />
        
        
        
        <Route path={`${match.path}/:id`} component={IssueDetail} />
        <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </React.Fragment>
    );
  }
}