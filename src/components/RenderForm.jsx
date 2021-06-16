import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Formio } from 'react-formio';
import gds from '@ukhomeoffice/formio-gds-template/lib';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs';

import config from '../config';
import useAxiosInstance from '../utils/axiosInstance';
import LoadingSpinner from '../forms/LoadingSpinner';
import { useKeycloak } from '../utils/keycloak';
import { augmentRequest, interpolate } from '../utils/formioSupport';
import ErrorSummary from '../govuk/ErrorSummary';
import findAndFormat from '../utils/findAndFormat';
import { SHORT_DATE_FORMAT } from '../constants';

Formio.use(gds);

const RenderForm = ({ formName, onSubmit, onCancel, preFillData, children }) => {
  const [error, setError] = useState(null);
  const [form, setForm] = useState({});
  const [isLoaderVisible, setLoaderVisibility] = useState(true);
  const [formattedPreFillData, setFormattedPreFillData] = useState();
  const [submitted, setSubmitted] = useState(false);
  const keycloak = useKeycloak();
  const formApiClient = useAxiosInstance(keycloak, config.formApiUrl);

  Formio.plugins = [augmentRequest(keycloak)];

  useEffect(() => {
    interpolate(form, {
      keycloakContext: {
        accessToken: keycloak.token,
        refreshToken: keycloak.refreshToken,
        sessionId: keycloak.tokenParsed.session_state,
        email: keycloak.tokenParsed.email,
        givenName: keycloak.tokenParsed.given_name,
        familyName: keycloak.tokenParsed.family_name,
        subject: keycloak.subject,
        url: keycloak.authServerUrl,
        realm: keycloak.realm,
        roles: keycloak.tokenParsed.realm_access.roles,
        groups: keycloak.tokenParsed.groups,
      },
      environmentContext: {
        referenceDataUrl: config.refdataApiUrl,
      },
    });
  }, [form]);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const loadForm = async () => {
      try {
        const formResponse = await formApiClient.get(`/form/name/${formName}`);
        setForm(formResponse.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoaderVisibility(false);
      }
    };

    const formatPreFillData = () => {
      if (!preFillData) {
        setFormattedPreFillData(null);
      } else {
        /*
         * Due to formio prefilling issues, findAndFormat is used in order to correctly
         * prefill the form dob and docExpiry fields
         * Threat indicators arrives as an array of strings, this prepoulates correctly
         * however it does not match the formatting expected by workflows further down the
         * line. This means it needs to be changed to match the expected data structure
         * THESE ARE ALL TEMPORARY FIXES
        */
        findAndFormat(preFillData, 'dob', (dob) => (dob ? dob.split('-').reverse().join('/') : ''));
        findAndFormat(
          preFillData,
          'docExpiry',
          (docExpiry) => (docExpiry ? dayjs(0).add(docExpiry, 'days').format(SHORT_DATE_FORMAT) : ''),
        );
        findAndFormat(
          preFillData,
          'threatIndicators',
          (threatIndicators) => (threatIndicators[0] ? threatIndicators.map((threatIndicator) => ({ indicator: threatIndicator })) : []),
        );
        setFormattedPreFillData(
          {
            data: {
              environmentContext: {
                referenceDataUrl: config.refdataApiUrl,
              },
              ...preFillData,
            },
          },
        );
      }
    };

    loadForm();
    formatPreFillData();
    return () => {
      source.cancel('Cancelling request');
    };
  }, []);

  if (submitted && children) {
    return children;
  }

  return (
    <>
      <LoadingSpinner loading={isLoaderVisible}>
        {error && (
          <ErrorSummary
            title="There is a problem"
            errorList={[
              { children: error },
            ]}
          />
        )}
        {!isEmpty(form) && (
          <Form
            form={form}
            submission={formattedPreFillData}
            onSubmit={async (data) => {
              setLoaderVisibility(true);
              try {
                await onSubmit(data, form);
                setSubmitted(true);
              } catch (e) {
                setError(e.message);
              } finally {
                setLoaderVisibility(false);
              }
            }}
            onNextPage={() => {
              window.scrollTo(0, 0);
            }}
            onPrevPage={() => {
              window.scrollTo(0, 0);
              setError(null);
            }}
            options={{
              noAlerts: true,
              hooks: {
                beforeCancel: async () => {
                  if (onCancel) {
                    await onCancel();
                  } else {
                    history.go(0);
                  }
                },
              },
            }}
          />
        )}
      </LoadingSpinner>
    </>
  );
};

export default RenderForm;
