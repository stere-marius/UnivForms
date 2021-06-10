import React, { useEffect, useState, useCallback } from "react";

const QuestionMarkBoxAttributesPanel = ({ questionDB, onAttributeChange }) => {
  const [attributes, setAttributesQuestion] = useState(
    questionDB.atribute || {}
  );

  const setAttributes = useCallback(
    attributes => {
      setAttributesQuestion(attributes);
      onAttributeChange(attributes);
    },
    [onAttributeChange]
  );

  const [isPanelMinAnswers, setPanelMinAnswersVisible] = useState(
    Boolean(attributes.validareRaspuns?.selectareMinima)
  );

  const [isPanelExactAnswers, setPanelExactAnswersVisible] = useState(
    Boolean(attributes.validareRaspuns?.selectareExacta)
  );

  useEffect(() => {
    if (!attributes.validareRaspuns) {
      setAttributes({ ...attributes, validareRaspuns: {} });
    }
    setPanelMinAnswersVisible(
      Boolean(attributes.validareRaspuns?.selectareMinima)
    );
    setPanelExactAnswersVisible(
      Boolean(attributes.validareRaspuns?.selectareExacta)
    );
  }, [attributes, setAttributes]);

  const handleRandomOrder = e => {
    setAttributes({
      ...attributes,
      afisareRaspunsuriOrdineAleatorie: e.target.checked,
    });
  };

  const handleVisibilityMinPanel = e => {
    setPanelMinAnswersVisible(e.target.checked);
  };
  const handleVisibilityExactPanel = e => {
    setPanelExactAnswersVisible(e.target.checked);
  };

  const handleChangeExactSelection = e => {
    const value = e.target.value;

    if (value > 0 && value <= questionDB.raspunsuri.length) {
      setAttributes({
        ...attributes,
        validareRaspuns: {
          selectareExacta: value,
          textRaspunsInvalid: attributes.validareRaspuns?.textRaspunsInvalid,
        },
      });
    }
  };

  const handleChangeMinSelection = e => {
    const value = e.target.value;

    if (value > 0 && value < questionDB.raspunsuri.length) {
      setAttributes({
        ...attributes,
        validareRaspuns: {
          selectareMinima: value,
          textRaspunsInvalid: attributes.validareRaspuns?.textRaspunsInvalid,
        },
      });
    }
  };

  const handleChangeInvalidAnswer = e => {
    const value = e.target.value;

    setAttributes({
      ...attributes,
      validareRaspuns: {
        ...attributes.validareRaspuns,
        textRaspunsInvalid: value,
      },
    });
  };

  return (
    <div className="mx-4 fs-4">
      <div className="form-check">
        <input
          className="form-check-input form-input-green"
          type="checkbox"
          checked={attributes.afisareRaspunsuriOrdineAleatorie || false}
          onChange={handleRandomOrder}
          id="checkboxRaspunsuriRandom"
        />
        <label className="form-check-label" for="checkboxRaspunsuriRandom">
          Afisare raspunsuri in ordine aleatorie
        </label>
      </div>

      <div className="form-check">
        <input
          className="form-check-input form-input-green"
          type="checkbox"
          checked={isPanelMinAnswers}
          onChange={handleVisibilityMinPanel}
          id="checkboxRaspunsuriMinime"
        />
        <label className="form-check-label" for="checkboxRaspunsuriMinime">
          Selectare numar raspunsuri minime transmitere
        </label>
      </div>

      {isPanelMinAnswers && (
        <div className="d-flex flex-column align-items-start">
          <label className="form-check-label" for="raspunsuriMinime">
            Numar raspunsuri minime
          </label>
          <input
            className="form-input-green rounded"
            type="number"
            value={
              (attributes.validareRaspuns &&
                attributes.validareRaspuns.selectareMinima) ||
              0
            }
            onChange={handleChangeMinSelection}
            id="raspunsuriMinime"
          />
        </div>
      )}

      <div className="form-check">
        <input
          className="form-check-input form-input-green"
          type="checkbox"
          checked={isPanelExactAnswers}
          onChange={handleVisibilityExactPanel}
          id="checkboxRaspunsuriExacte"
        />
        <label className="form-check-label" for="checkboxRaspunsuriExacte">
          Selectare numar raspunsuri exacte transmitere
        </label>
      </div>

      {isPanelExactAnswers && (
        <div className="d-flex flex-column align-items-start">
          <label className="form-check-label" for="raspunsuriExacte">
            Numar raspunsuri exacte
          </label>
          <input
            className="form-input-green rounded"
            type="number"
            value={
              (attributes.validareRaspuns &&
                attributes.validareRaspuns.selectareExacta) ||
              0
            }
            onChange={handleChangeExactSelection}
            id="raspunsuriExacte"
          />
        </div>
      )}

      {(isPanelExactAnswers || isPanelMinAnswers) && (
        <div className="input-group d-flex flex-column">
          <label className="form-check-label mt-3" for="textRaspunsInvalid">
            Text raspuns invalid
          </label>
          <input
            type="text"
            className="form-control form-input-green mt-1"
            placeholder="Text raspuns invalid"
            id="textRaspunsInvalid"
            value={
              (attributes.validareRaspuns &&
                attributes.validareRaspuns.textRaspunsInvalid) ||
              ""
            }
            onChange={handleChangeInvalidAnswer}
            style={{ minWidth: "0", width: "50%" }}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionMarkBoxAttributesPanel;
