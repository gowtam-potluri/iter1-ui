import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Col, Panel, Form, FormGroup, FormControl, ControlLabel,
  ButtonToolbar, Button, Alert,
} from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';
import Toast from './Toast.jsx';

export default class IssueEdit extends React.Component {
  constructor() {
    super();
    this.state = {
      issue: {},
      invalidFields: {},
      showingValidation: false,
      toastVisible: false,
      toastMessage: '',
      toastType: 'success',
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
    this.showValidation = this.showValidation.bind(this);
    this.showSuccess = this.showSuccess.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } } } = prevProps;
    const { match: { params: { id } } } = this.props;
    if (id !== prevId) {
      this.loadData();
    }
  }

  onChange(event, naturalValue) {
    const { name, value: textValue } = event.target;
    const value = naturalValue === undefined ? textValue : naturalValue;
    this.setState(prevState => ({
      issue: { ...prevState.issue, [name]: value },
    }));
  }

  onValidityChange(event, valid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.showValidation();
    const { issue, invalidFields } = this.state;
    if (Object.keys(invalidFields).length !== 0) return;

    const query = `mutation patissueUpdate(
      $id: Int!
      $changes: PatIssueUpdateInputs!
    ) {
      patissueUpdate(
        id: $id
        changes: $changes
      ) {
        id district helpreq name
        quantity created phone description
      }
    }`;

    const { id, created, ...changes } = issue;
    const data = await graphQLFetch(query, { changes, id }, this.showError);
    if (data) {
      this.setState({ issue: data.patissueUpdate });
      this.showSuccess('Updated issue successfully');
    }
  }

  async loadData() {
    const query = `query patissue($id: Int!) {
        patissue(id: $id) {
          id district helpreq name
          quantity created phone description
        }
      }`;

    const { match: { params: { id } } } = this.props;
    const data = await graphQLFetch(query, { id }, this.showError);
    this.setState({ issue: data ? data.patissue : {}, invalidFields: {} });
  }
  showValidation() {
    this.setState({ showingValidation: true });
  }

  dismissValidation() {
    this.setState({ showingValidation: false });
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
    const { issue: { id } } = this.state;
    const { match: { params: { id: propsId } } } = this.props;
    if (id == null) {
      if (propsId != null) {
        return <h3>{`Issue with ID ${propsId} not found.`}</h3>;
      }
      return null;
    }

    const { invalidFields, showingValidation } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fields before submitting.
        </Alert>
      );
    }

    const { issue: { district, helpreq } } = this.state;
    const { issue: { name, quantity, description } } = this.state;
    const { issue: { created, phone } } = this.state;
    const { toastVisible, toastMessage, toastType } = this.state;

    return (
      <Panel>
      <Panel.Heading>
        <Panel.Title>{`Editing issue: ${id}`}</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <Form horizontal onSubmit={this.handleSubmit}>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>Created</Col>
            <Col sm={9}>
              <FormControl.Static>
                {created.toDateString()}
              </FormControl.Static>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>Help Required</Col>
            <Col sm={9}>
              <FormControl
                componentClass="select"
                name="helpreq"
                value={helpreq}
                onChange={this.onChange}
              >
                  <option value="True">True</option>
                  <option value="False">False</option>
                  </FormControl>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Name</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  name="name"
                  value={name}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Quantity</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={NumInput}
                  name="quantity"
                  value={quantity}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup validationState={
              invalidFields.phone ? 'error' : null
            }
            >
              <Col componentClass={ControlLabel} sm={3}>Phone</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  onValidityChange={this.onValidityChange}
                  name="phone"
                  value={phone}
                  onChange={this.onChange}
                  
                  key={id}
                />
              <FormControl.Feedback />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>District</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  size={50}
                  name="district"
                  value={district}
                  onChange={this.onChange}
                  key={id}
                />
               </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Description</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  tag="textarea"
                  rows={4}
                  cols={50}
                  name="description"
                  value={description}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={6}>
                <ButtonToolbar>
                  <Button bsStyle="primary" type="submit">Submit</Button>
                  <LinkContainer to="/patients">
                    <Button bsStyle="link">Back</Button>
                  </LinkContainer>
                </ButtonToolbar>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={9}>{validationMessage}</Col>
            </FormGroup>
          </Form>
          
        </Panel.Body>
        <Panel.Footer>
          <Link to={`/patedit/${id - 1}`}>Prev</Link>
          {' | '}
          <Link to={`/patedit/${id + 1}`}>Next</Link>
        </Panel.Footer>
        <Toast
          showing={toastVisible}
          onDismiss={this.dismissToast}
          bsStyle={toastType}
        >
          {toastMessage}
        </Toast>
      </Panel>
    );
  }
}