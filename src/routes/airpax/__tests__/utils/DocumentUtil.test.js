import { DocumentUtil } from '../../utils';
import { UNKNOWN_TEXT } from '../../../../constants';

describe('DocumentUtil', () => {
  it('should get a document if present', () => {
    const person = {
      document: null,
    };

    const output = DocumentUtil.get(person);
    expect(output).toBeNull();
  });

  it('should shown unknown expiry when document expiry date is not present', () => {
    const person = {
      document: null,
    };

    const output = DocumentUtil.docExpiry(person);
    expect(output).toEqual(`Expires ${UNKNOWN_TEXT}`);
  });

  it('should show unknown validity when document validity date is not present', () => {
    const person = {
      document: null,
    };

    const output = DocumentUtil.docValidity(person);
    expect(output).toEqual(`Valid from ${UNKNOWN_TEXT}`);
  });

  it('should shown unknown when document identification is not present', () => {
    const person = {
      document: null,
    };

    const output = DocumentUtil.docIdentification(person);
    expect(output).toEqual(UNKNOWN_TEXT);
  });

  it('should show unknown when document country of issue is not present', () => {
    const person = {
      document: null,
    };

    const output = DocumentUtil.docCountry(person);
    expect(output).toEqual(`Issued by ${UNKNOWN_TEXT}`);
  });
});
