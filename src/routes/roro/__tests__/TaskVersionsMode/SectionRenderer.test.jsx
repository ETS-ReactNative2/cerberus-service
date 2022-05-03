import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { screen, render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import { RORO_ACCOMPANIED_FREIGHT } from '../../../../constants';
import {
  renderBookingSection,
  renderVehicleSection,
  renderTrailerSection,
  renderOccupantsSection,
  renderPrimaryTraveller,
  renderPrimaryTravellerDocument,
  renderOccupantCarrierCountsSection,
  renderDocumentExpiry,
} from '../../TaskDetails/TaskVersionsMode/SectionRenderer';

import {
  hasDriverNoPaxHasCategoryCounts,
  noDriverNoPaxHasCategoryCounts,
  noDriverNoPaxNoCategoryCounts,
  hasDriverHasPaxHasCategoryCounts,
  noDriverHasPaxHasCategoryCounts,
  noDriverNoPaxNoCategoryAndNoUnknownCounts,
} from '../../__fixtures__/section-renderer/sectionRendererTaskDetails';

describe('SectionRenderer', () => {
  describe('renderBookingSection', () => {
    it('should return undefined if contents is undefined', () => {
      const input = {
        fieldSetName: 'field-set-name',
      };

      const section = renderBookingSection(input);

      expect(section).toBeUndefined();
    });

    it('should return undefined if contents is null', () => {
      const input = {
        fieldSetName: 'field-set-name',
        contents: null,
      };

      const section = renderBookingSection(input);

      expect(section).toBeUndefined();
    });

    it('should return undefined if contents is empty', () => {
      const input = {
        fieldSetName: 'field-set-name',
        contents: [],
      };

      const section = renderBookingSection(input);

      expect(section).toBeUndefined();
    });

    it('should return fields if not hidden', () => {
      const input = {
        fieldSetName: 'field-set-name',
        contents: [
          {
            fieldName: 'Field 1',
            type: 'STRING',
            content: 'value 1',
            versionLastUpdated: null,
            propName: 'field1',
          },
          {
            fieldName: 'Field 2',
            type: 'STRING',
            content: 'value 2',
            versionLastUpdated: null,
            propName: 'field2',
          },
        ],
      };

      const section = renderBookingSection(input);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">field-set-name</h3>
          <div>
            <div className="govuk-task-details-grid-item">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Field 1</span></li>
                <li className="govuk-grid-value font__bold">value 1</li>
              </ul>
            </div>
            <div className="govuk-task-details-grid-item">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Field 2</span></li>
                <li className="govuk-grid-value font__bold">value 2</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });

    it('should not render hidden fields', () => {
      const input = {
        fieldSetName: 'field-set-name',
        contents: [
          {
            fieldName: 'Field 1',
            type: 'HIDDEN',
            content: 'value 1',
            versionLastUpdated: null,
            propName: 'field1',
          },
        ],
      };

      const section = renderBookingSection(input);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">field-set-name</h3>
          <div />
        </div>,
      ));
    });

    it('should render replaced field name for date and time and check-in', () => {
      const input = {
        fieldSetName: 'field-set-name',
        contents: [
          {
            fieldName: 'Date and time',
            type: 'STRING',
            content: 'value 1',
            versionLastUpdated: null,
            propName: 'field1',
          },
          {
            fieldName: 'Check-in',
            type: 'STRING',
            content: 'value 2',
            versionLastUpdated: null,
            propName: 'field2',
          },
        ],
      };

      const section = renderBookingSection(input);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">field-set-name</h3>
          <div>
            <div className="govuk-task-details-grid-item">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Booking date and time</span></li>
                <li className="govuk-grid-value font__bold">value 1</li>
              </ul>
            </div>
            <div className="govuk-task-details-grid-item">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Check-in date and time</span></li>
                <li className="govuk-grid-value font__bold">value 2</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });

    it('should leave field name for date and time and check-in untouched if not a match', () => {
      const input = {
        fieldSetName: 'field-set-name',
        contents: [
          {
            fieldName: 'Date and timee',
            type: 'STRING',
            content: 'value 1',
            versionLastUpdated: null,
            propName: 'field1',
          },
          {
            fieldName: 'Check-inn',
            type: 'STRING',
            content: 'value 2',
            versionLastUpdated: null,
            propName: 'field2',
          },
        ],
      };

      const section = renderBookingSection(input);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">field-set-name</h3>
          <div>
            <div className="govuk-task-details-grid-item">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Date and timee</span></li>
                <li className="govuk-grid-value font__bold">value 1</li>
              </ul>
            </div>
            <div className="govuk-task-details-grid-item">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Check-inn</span></li>
                <li className="govuk-grid-value font__bold">value 2</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });
  });

  describe('renderVehicleSection', () => {
    it('should return undefined if movement mode is RORO_UNACCOMPANIED_FREIGHT', () => {
      const input = {
        contents: [
          {
            fieldName: 'Vehicle registration',
            type: 'STRING',
            content: 'KP07YXG',
            versionLastUpdated: null,
            propName: 'registrationNumber',
          },
        ],
      };

      const body = renderVehicleSection(input, 'RORO_UNACCOMPANIED_FREIGHT');

      expect(body).toBeUndefined();
    });

    it('should return undefined if contents is empty', () => {
      const input = {
        contents: [],
      };

      const section = renderVehicleSection(input, 'RORO_TOURIST');

      expect(section).toBeUndefined();
    });

    it('should return fields if not hidden and should only show vehicle specific fields', () => {
      const input = {
        contents: [
          {
            fieldName: 'Vehicle registration',
            type: 'STRING',
            content: 'GB09KLT',
            versionLastUpdated: null,
            propName: 'registrationNumber',
          },
          {
            fieldName: 'Make',
            type: 'STRING',
            content: 'FORD',
            versionLastUpdated: null,
            propName: 'make',
          },
          {
            fieldName: 'Model',
            type: 'STRING',
            content: 'TRANSIT',
            versionLastUpdated: null,
            propName: 'model',
          },
          {
            fieldName: 'Type',
            type: 'STRING',
            content: 'VAN',
            versionLastUpdated: null,
            propName: 'type',
          },
          {
            fieldName: 'Country of registration',
            type: 'STRING',
            content: 'GB',
            versionLastUpdated: null,
            propName: 'registrationNationality',
          },
          {
            fieldName: 'Colour',
            type: 'STRING',
            content: 'RED',
            versionLastUpdated: null,
            propName: 'colour',
          },
          {
            fieldName: 'Net weight',
            type: 'WEIGHT',
            content: '3455kg',
            versionLastUpdated: null,
            propName: 'netWeight',
          },
        ],
      };

      const section = renderVehicleSection(input, 'RORO_TOURIST');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Vehicle</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Vehicle registration</span></li>
                <li className="govuk-grid-value font__bold">GB09KLT</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Make</span></li>
                <li className="govuk-grid-value font__bold">FORD</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Model</span></li>
                <li className="govuk-grid-value font__bold">TRANSIT</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Type</span></li>
                <li className="govuk-grid-value font__bold">VAN</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Country of registration</span></li>
                <li className="govuk-grid-value font__bold">GB</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Colour</span></li>
                <li className="govuk-grid-value font__bold">RED</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });

    it('should not render hidden fields', () => {
      const input = {
        contents: [
          {
            fieldName: 'Vehicle registration',
            type: 'HIDDEN',
            content: 'KP07YXG',
            versionLastUpdated: null,
            propName: 'registrationNumber',
          },
        ],
      };

      const section = renderVehicleSection(input, 'RORO_TOURIST');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Vehicle</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column" />
        </div>,
      ));
    });

    it('should render entity search link if registration number and link field are present', () => {
      const input = {
        contents: [
          {
            fieldName: 'Vehicle registration',
            type: 'STRING',
            content: 'KP07YXG',
            versionLastUpdated: null,
            propName: 'registrationNumber',
          },
          {
            fieldName: 'Entity Search URL',
            type: 'HIDDEN',
            content: 'http://localhost:4020/search?term=1234567890&type=VEHICLE&fields=["id"]',
            versionLastUpdated: null,
            propName: 'vehicleEntitySearchUrl',
          },
        ],
      };

      const section = renderVehicleSection(input, 'RORO_TOURIST');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Vehicle</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Vehicle registration</span></li>
                <li className="govuk-grid-value font__bold"><a href="http://localhost:4020/search?term=1234567890&amp;type=VEHICLE&amp;fields=[&quot;id&quot;]" target="_blank" rel="noreferrer noopener">KP07YXG</a></li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });
  });

  describe('renderTrailerSection', () => {
    it('should return undefined if content of first trailer field is null', () => {
      const input = {
        contents: [
          {
            fieldName: 'Trailer registration number',
            type: 'STRING',
            content: null,
            versionLastUpdated: null,
            propName: 'trailerRegistrationNumber',
          },
        ],
      };

      const section = renderTrailerSection(input, 'RORO_ACCOMPANIED_FREIGHT');

      expect(section).toBeUndefined();
    });

    it('should return fields if not hidden and should only show trailer specific fields', () => {
      const input = {
        contents: [
          {
            fieldName: 'Trailer registration number',
            type: 'STRING',
            content: 'LQ18ZAB',
            versionLastUpdated: null,
            propName: 'trailerRegistrationNumber',
          },
          {
            fieldName: 'Trailer Type',
            type: 'STRING',
            content: 'TR',
            versionLastUpdated: null,
            propName: 'trailerType',
          },
          {
            fieldName: 'Trailer country of registration',
            type: 'STRING',
            content: 'GB',
            versionLastUpdated: null,
            propName: 'trailerRegistrationNationality',
          },
          {
            fieldName: 'Trailer length',
            type: 'DISTANCE',
            content: '75',
            versionLastUpdated: null,
            propName: 'trailerLength',
          },
          {
            fieldName: 'Trailer height',
            type: 'DISTANCE',
            content: '5',
            versionLastUpdated: null,
            propName: 'trailerHeight',
          },
          {
            fieldName: 'Empty or loaded',
            type: 'STRING',
            content: 'Loaded',
            versionLastUpdated: null,
            propName: 'trailerEmptyOrLoaded',
          },
          {
            fieldName: 'Make',
            type: 'STRING',
            content: 'FORD',
            versionLastUpdated: null,
            propName: 'make',
          },
        ],
      };

      const section = renderTrailerSection(input, 'RORO_ACCOMPANIED_FREIGHT');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Trailer</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Trailer registration number</span></li>
                <li className="govuk-grid-value font__bold">LQ18ZAB</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Trailer Type</span></li>
                <li className="govuk-grid-value font__bold">TR</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Trailer country of registration</span></li>
                <li className="govuk-grid-value font__bold">GB</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Trailer length</span></li>
                <li className="govuk-grid-value font__bold">75m</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Trailer height</span></li>
                <li className="govuk-grid-value font__bold">5m</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Empty or loaded</span></li>
                <li className="govuk-grid-value font__bold">Loaded</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });

    it('should not render hidden fields', () => {
      const input = {
        contents: [
          {
            fieldName: 'Trailer registration number',
            type: 'HIDDEN',
            content: 'LQ18ZAB',
            versionLastUpdated: null,
            propName: 'trailerRegistrationNumber',
          },
        ],
      };

      const section = renderTrailerSection(input, 'RORO_ACCOMPANIED_FREIGHT');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Trailer</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column" />
        </div>,
      ));
    });

    it('should render entity search link if trailer registration number and link field are present', () => {
      const input = {
        contents: [
          {
            fieldName: 'Trailer registration number',
            type: 'STRING',
            content: 'LQ18ZYH',
            versionLastUpdated: null,
            propName: 'trailerRegistrationNumber',
          },
          {
            fieldName: 'Entity Search URL',
            type: 'HIDDEN',
            content: 'http://localhost:4020/search?term=1212121212&type=VEHICLE&fields=["id"]',
            versionLastUpdated: null,
            propName: 'trailerEntitySearchUrl',
          },
        ],
      };

      const section = renderTrailerSection(input, 'RORO_ACCOMPANIED_FREIGHT');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Trailer</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Trailer registration number</span></li>
                <li className="govuk-grid-value font__bold"><a href="http://localhost:4020/search?term=1212121212&amp;type=VEHICLE&amp;fields=[&quot;id&quot;]" target="_blank" rel="noreferrer noopener">LQ18ZYH</a></li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });
  });

  describe('renderOccupantsSection', () => {
    it('should return undefined if second passenger is null or undefined', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
        ],
      };

      const section = renderOccupantsSection(input, 'any-icon');

      expect(section).toBeUndefined();
    });

    it('should return second passenger fields if present', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
        ],
      };
      const tree = renderer.create(renderOccupantsSection(input, 'any-icon')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should return second passenger entity search link if fields if present', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Entity Search URL',
                type: 'HIDDEN',
                content: 'http://localhost:4020/search?term=98989898&type=PERSON&fields=["id"]',
                versionLastUpdated: null,
                propName: 'entitySearchUrl',
              },
            ],
          },
        ],
      };

      const tree = renderer.create(renderOccupantsSection(input, 'any-icon')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should not show passenger heading if movement mode icon is the tourist group icon', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
        ],
      };

      const tree = renderer.create(renderOccupantsSection(input, 'c-icon-group')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should return other passenger fields if present', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR OTHER PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
        ],
      };

      const tree = renderer.create(renderOccupantsSection(input, 'any-icon')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should return other passenger entity search link if fields if present', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR OTHER PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Entity Search URL',
                type: 'HIDDEN',
                content: 'http://localhost:4020/search?term=56565656&type=PERSON&fields=["id"]',
                versionLastUpdated: null,
                propName: 'entitySearchUrl',
              },
            ],
          },
        ],
      };

      const tree = renderer.create(renderOccupantsSection(input, 'any-icon')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should return mulitple other passenger fields if present', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR OTHER PASSENGER 1',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS OTHER PASSENGER 2',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
        ],
      };

      const tree = renderer.create(renderOccupantsSection(input, 'any-icon')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should not render hidden fields', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'HIDDEN',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'HIDDEN',
                content: 'MR OTHER PASSENGER 1',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'HIDDEN',
                content: 'MRS OTHER PASSENGER 2',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
        ],
      };

      const tree = renderer.create(renderOccupantsSection(input, 'any-icon')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render occupants when bookingDate value is null', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR OTHER PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Entity Search URL',
                type: 'HIDDEN',
                content: 'http://localhost:4020/search?term=56565656&type=PERSON&fields=["id"]',
                versionLastUpdated: null,
                propName: 'entitySearchUrl',
              },
            ],
          },
        ],
      };

      const bookingDate = {
        fieldName: 'Date and time',
        type: 'BOOKING_DATETIME',
        content: null,
        versionLastUpdated: null,
        propName: 'dateBooked',
      };

      const tree = renderer.create(renderOccupantsSection(input, 'any-icon', bookingDate)).toJSON();
      expect(tree).toMatchSnapshot();
    });

    // TODO
    it('should render occupants when passport country of issue code is invalid', () => {
      const input = {
        fieldSetName: 'Passengers',
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR FIRST PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Travel document country of issue',
                type: 'STRING',
                content: 'UN',
                versionLastUpdated: null,
                propName: 'docCountryOfIssue',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MRS SECOND PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Travel document country of issue',
                type: 'STRING',
                content: 'UN',
                versionLastUpdated: null,
                propName: 'docCountryOfIssue',
              },
            ],
          },
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR OTHER PASSENGER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Entity Search URL',
                type: 'HIDDEN',
                content: 'http://localhost:4020/search?term=56565656&type=PERSON&fields=["id"]',
                versionLastUpdated: null,
                propName: 'entitySearchUrl',
              },
            ],
          },
        ],
      };

      const bookingDate = {
        fieldName: 'Date and time',
        type: 'BOOKING_DATETIME',
        content: null,
        versionLastUpdated: null,
        propName: 'dateBooked',
      };

      render(renderOccupantsSection(input, 'any-icon', bookingDate));
      expect(screen.queryAllByText('Unknown (Unknown)')).toHaveLength(2);
    });
  });

  describe('renderPrimaryTraveller', () => {
    it('should return undefined if first childset contents is empty', () => {
      const input = {
        childSets: [
          {
            contents: [],
          },
        ],
      };

      const section = renderPrimaryTraveller(input, 'any-icon');

      expect(section).toBeUndefined();
    });

    it('should render traveller and document fields if icon is single tourist icon', () => {
      const input = {
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR PRIMARY TRAVELLER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Date of birth',
                type: 'SHORT_DATE',
                content: '4171',
                versionLastUpdated: null,
                propName: 'dob',
              },
              {
                fieldName: 'Gender',
                type: 'STRING',
                content: 'M',
                versionLastUpdated: null,
                propName: 'gender',
              },
              {
                fieldName: 'Nationality',
                type: 'STRING',
                content: 'GB',
                versionLastUpdated: null,
                propName: 'nationality',
              },
              {
                fieldName: 'Travel document type',
                type: 'STRING',
                content: 'PASSPORT',
                versionLastUpdated: null,
                propName: 'docType',
              },
              {
                fieldName: 'Travel document number',
                type: 'STRING',
                content: 'ST0111111',
                versionLastUpdated: null,
                propName: 'docNumber',
              },
              {
                fieldName: 'Travel document expiry',
                type: 'SHORT_DATE',
                content: '18628',
                versionLastUpdated: null,
                propName: 'docExpiry',
              },
              {
                fieldName: 'Pole ID',
                type: 'String',
                content: '222841bd7ba8e303cad527111a5de222',
                versionLastUpdated: null,
                propName: 'poleId',
              },
            ],
          },
        ],
      };

      const section = renderPrimaryTraveller(input, 'c-icon-person');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Primary Traveller</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Name</span></li>
                <li className="govuk-grid-value font__bold">MR PRIMARY TRAVELLER</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Date of birth</span></li>
                <li className="govuk-grid-value font__bold">03/06/1981</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Gender</span></li>
                <li className="govuk-grid-value font__bold">M</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Nationality</span></li>
                <li className="govuk-grid-value font__bold">GB</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Travel document type</span></li>
                <li className="govuk-grid-value font__bold">PASSPORT</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Travel document number</span></li>
                <li className="govuk-grid-value font__bold">ST0111111</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Travel document expiry</span></li>
                <li className="govuk-grid-value font__bold">01/01/2021</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });

    it('should only render traveller fields and not document fields if icon is not single tourist icon', () => {
      const input = {
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR PRIMARY TRAVELLER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Date of birth',
                type: 'SHORT_DATE',
                content: '4171',
                versionLastUpdated: null,
                propName: 'dob',
              },
              {
                fieldName: 'Gender',
                type: 'STRING',
                content: 'M',
                versionLastUpdated: null,
                propName: 'gender',
              },
              {
                fieldName: 'Nationality',
                type: 'STRING',
                content: 'GB',
                versionLastUpdated: null,
                propName: 'nationality',
              },
              {
                fieldName: 'Travel document type',
                type: 'STRING',
                content: 'PASSPORT',
                versionLastUpdated: null,
                propName: 'docType',
              },
            ],
          },
        ],
      };

      const section = renderPrimaryTraveller(input, 'any-icon');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Primary Traveller</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Name</span></li>
                <li className="govuk-grid-value font__bold">MR PRIMARY TRAVELLER</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Date of birth</span></li>
                <li className="govuk-grid-value font__bold">03/06/1981</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Gender</span></li>
                <li className="govuk-grid-value font__bold">M</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Nationality</span></li>
                <li className="govuk-grid-value font__bold">GB</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });

    it('should render primary traveller entity search link if fields are present', () => {
      const input = {
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR PRIMARY TRAVELLER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Entity Search URL',
                type: 'HIDDEN',
                content: 'http://localhost:4020/search?term=2828282828&type=PERSON&fields=["id"]',
                versionLastUpdated: null,
                propName: 'entitySearchUrl',
              },
            ],
          },
        ],
      };

      const section = renderPrimaryTraveller(input, 'any-icon');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Primary Traveller</h3>
          <div className="govuk-grid-row enrichment-counts">
            <div className="labels">
              <div className="govuk-grid-column-one-third"><span className="font__light">Previous RoRo movements</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Examinations</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__light">Seizures</span></div>
            </div>
            <div className="values">
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
              <div className="govuk-grid-column-one-third"><span className="font__bold">-</span></div>
            </div>
          </div>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Name</span></li>
                <li className="govuk-grid-value font__bold"><a href="http://localhost:4020/search?term=2828282828&amp;type=PERSON&amp;fields=[&quot;id&quot;]" target="_blank" rel="noreferrer noopener">MR PRIMARY TRAVELLER</a></li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });
  });

  describe('renderPrimaryTravellerDocument', () => {
    it('should return undefined if first childset contents is empty', () => {
      const input = {
        childSets: [
          {
            contents: [],
          },
        ],
      };

      const section = renderPrimaryTravellerDocument(input, 'any-icon');

      expect(section).toBeUndefined();
    });

    it('should render only render document fields', () => {
      const input = {
        childSets: [
          {
            contents: [
              {
                fieldName: 'Name',
                type: 'STRING',
                content: 'MR PRIMARY TRAVELLER',
                versionLastUpdated: null,
                propName: 'name',
              },
              {
                fieldName: 'Travel document type',
                type: 'STRING',
                content: 'PASSPORT',
                versionLastUpdated: null,
                propName: 'docType',
              },
              {
                fieldName: 'Travel document number',
                type: 'STRING',
                content: 'ST0111111',
                versionLastUpdated: null,
                propName: 'docNumber',
              },
              {
                fieldName: 'Travel document expiry',
                type: 'SHORT_DATE',
                content: '18628',
                versionLastUpdated: null,
                propName: 'docExpiry',
              },
            ],
          },
        ],
      };

      const section = renderPrimaryTravellerDocument(input, 'any-icon');

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="task-details-container bottom-border-thick">
          <h3 className="title-heading">Document</h3>
          <div className="govuk-task-details-grid-column">
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Travel document type</span></li>
                <li className="govuk-grid-value font__bold">PASSPORT</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Travel document number</span></li>
                <li className="govuk-grid-value font__bold">ST0111111</li>
              </ul>
            </div>
            <div className="">
              <ul>
                <li className="govuk-grid-key font__light"><span className="govuk-grid-key font__light">Travel document expiry</span></li>
                <li className="govuk-grid-value font__bold">01/01/2021</li>
              </ul>
            </div>
          </div>
        </div>,
      ));
    });
  });

  describe('renderOccupantCarrierCountsSection', () => {
    it('should render category counts when there is a driver, no passengers and counts are available', () => {
      const driverField = hasDriverNoPaxHasCategoryCounts.find(({ propName }) => propName === 'driver');
      const passengersField = hasDriverNoPaxHasCategoryCounts.find(({ propName }) => propName === 'passengers');
      const passengersMetadata = hasDriverNoPaxHasCategoryCounts.find(({ propName }) => propName === 'occupants');

      const section = renderOccupantCarrierCountsSection(driverField,
        passengersField, passengersMetadata, RORO_ACCOMPANIED_FREIGHT);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="govuk-task-details-counts-container">
          <div className="govuk-task-details-grid-row bottom-border">
            <span className="govuk-grid-key font__light">Category</span><span className="govuk-grid-value font__light">Number</span>
          </div>
          <div className="task-details-container">
            <div className="govuk-task-details-grid-row bottom-border">
              <ul>
                <li className="govuk-grid-value  font__grey font__bold">Infants</li>
              </ul>
              <span className="govuk-grid-value font__bold font__grey">0</span>
            </div>
            <div className="govuk-task-details-grid-row bottom-border">
              <ul>
                <li className="govuk-grid-value  font__grey font__bold">Children</li>
              </ul>
              <span className="govuk-grid-value font__bold font__grey">0</span>
            </div>
            <div className="govuk-task-details-grid-row bottom-border">
              <ul>
                <li className="govuk-grid-value  false font__bold">Adults</li>
              </ul>
              <span className="govuk-grid-value font__bold false">1</span>
            </div>
            <div className="govuk-task-details-grid-row">
              <ul>
                <li className="govuk-grid-value  font__grey font__bold">OAPs</li>
              </ul>
              <span className="govuk-grid-value font__bold font__grey">0</span>
            </div>
          </div>
        </div>,
      ));
    });

    it('should render category counts when there is no driver, no passengers but category counts are available', () => {
      const driverField = noDriverNoPaxHasCategoryCounts.find(({ propName }) => propName === 'driver');
      const passengersField = noDriverNoPaxHasCategoryCounts.find(({ propName }) => propName === 'passengers');
      const passengersMetadata = noDriverNoPaxHasCategoryCounts.find(({ propName }) => propName === 'occupants');

      const section = renderOccupantCarrierCountsSection(driverField,
        passengersField, passengersMetadata, RORO_ACCOMPANIED_FREIGHT);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="govuk-task-details-counts-container">
          <div className="govuk-task-details-grid-row bottom-border">
            <span className="govuk-grid-key font__light">Category</span>
            <span className="govuk-grid-value font__light">Number</span>
          </div>
          <div className="task-details-container">
            <div className="govuk-task-details-grid-row bottom-border">
              <ul>
                <li className="govuk-grid-value  font__grey font__bold">Infants</li>
              </ul>
              <span className="govuk-grid-value font__bold font__grey">0</span>
            </div>
            <div className="govuk-task-details-grid-row bottom-border">
              <ul>
                <li className="govuk-grid-value  font__grey font__bold">Children</li>
              </ul>
              <span className="govuk-grid-value font__bold font__grey">0</span>
            </div>
            <div className="govuk-task-details-grid-row bottom-border">
              <ul>
                <li className="govuk-grid-value  font__grey font__bold">Adults</li>
              </ul>
              <span className="govuk-grid-value font__bold font__grey">0</span>
            </div>
            <div className="govuk-task-details-grid-row">
              <ul>
                <li className="govuk-grid-value  font__grey font__bold">OAPs</li>
              </ul>
              <span className="govuk-grid-value font__bold font__grey">0</span>
            </div>
          </div>
        </div>,
      ));
    });

    it('should render unknown category count when there is no driver, 0 passengers but no valid category counts are available', () => {
      const driverField = noDriverNoPaxNoCategoryCounts.find(({ propName }) => propName === 'driver');
      const passengersField = noDriverNoPaxNoCategoryCounts.find(({ propName }) => propName === 'passengers');
      const passengersMetadata = noDriverNoPaxNoCategoryCounts.find(({ propName }) => propName === 'occupants');

      const section = renderOccupantCarrierCountsSection(driverField,
        passengersField, passengersMetadata, RORO_ACCOMPANIED_FREIGHT);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(
        <div className="govuk-task-details-counts-container">
          <div className="govuk-task-details-grid-row bottom-border">
            <span className="govuk-grid-key font__light">Category</span>
            <span className="govuk-grid-value font__light">Number</span>
          </div>
          <div className="task-details-container">
            <div className="govuk-task-details-grid-row">
              <ul>
                <li className="govuk-grid-value  false font__bold">Unknown</li>
              </ul>
              <span className="govuk-grid-value font__bold false">1</span>
            </div>
          </div>
        </div>,
      ));
    });

    it('should not render category count when there is a driver, 1+ passenger(s) and does/ does not have category counts', () => {
      const driverField = hasDriverHasPaxHasCategoryCounts.find(({ propName }) => propName === 'driver');
      const passengersField = hasDriverHasPaxHasCategoryCounts.find(({ propName }) => propName === 'passengers');
      const passengersMetadata = hasDriverHasPaxHasCategoryCounts.find(({ propName }) => propName === 'occupants');

      const section = renderOccupantCarrierCountsSection(driverField,
        passengersField, passengersMetadata, RORO_ACCOMPANIED_FREIGHT);

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(''));
    });

    it('should not render category count when there is no driver, but have one or more passengers and has category counts', () => {
      const driverField = noDriverHasPaxHasCategoryCounts.find(({ propName }) => propName === 'driver');
      const passengersField = noDriverHasPaxHasCategoryCounts.find(({ propName }) => propName === 'passengers');
      const passengersMetadata = noDriverHasPaxHasCategoryCounts.find(({ propName }) => propName === 'occupants');

      const section = renderOccupantCarrierCountsSection(
        driverField, passengersField, passengersMetadata, RORO_ACCOMPANIED_FREIGHT,
      );

      expect(ReactDOMServer.renderToString(section)).toEqual(ReactDOMServer.renderToString(''));
    });

    it('should not render category count section there is no driver, no passengers and unknown counts is null', () => {
      const driverField = noDriverNoPaxNoCategoryAndNoUnknownCounts.find(({ propName }) => propName === 'driver');
      const passengersField = noDriverNoPaxNoCategoryAndNoUnknownCounts.find(({ propName }) => propName === 'passengers');
      const passengersMetadata = noDriverNoPaxNoCategoryAndNoUnknownCounts.find(({ propName }) => propName === 'occupants');

      const section = renderOccupantCarrierCountsSection(driverField,
        passengersField, passengersMetadata, RORO_ACCOMPANIED_FREIGHT);
      expect(section).toBeUndefined();
    });
  });

  describe('Render the difference of travel booked date and passport expirty date', () => {
    it('Should render time left for passport expiry before travel booked date', () => {
      const arrivalTime = '2020-08-03T13:05:00';
      const passportExpiry = '01 Feb 2021';
      const expiry = renderDocumentExpiry(passportExpiry, arrivalTime);
      expect(expiry).toEqual('6 months after travel');
    });

    it('Should render passport expiry time passed before travel booked date', () => {
      const arrivalTime = '2020-02-01T13:05:00';
      const passportExpiry = '03 Aug 2019';
      const expiry = renderDocumentExpiry(passportExpiry, arrivalTime);
      expect(expiry).toEqual('6 months before travel');
    });
  });
});
