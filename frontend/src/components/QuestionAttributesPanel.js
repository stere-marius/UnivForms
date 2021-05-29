import React, { useEffect, useState } from "react";

const QuestionMarkBoxAttributesPanel = ({ questionDB, onAttributeChange }) => {
  const [attributes, setAttributesQuestion] = useState(
    questionDB.atribute || {}
  );

  const setAttributes = attributes => {
    setAttributesQuestion(attributes);
    onAttributeChange(attributes);
  };

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
  }, [attributes]);

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
      <div class="form-check">
        <input
          class="form-check-input form-input-green"
          type="checkbox"
          checked={attributes.afisareRaspunsuriOrdineAleatorie || false}
          onChange={handleRandomOrder}
          id="checkboxIntrebareObligatorie"
        />
        <label class="form-check-label" for="checkboxIntrebareObligatorie">
          Afisare raspunsuri in ordine aleatorie
        </label>
      </div>

      <div class="form-check">
        <input
          class="form-check-input form-input-green"
          type="checkbox"
          checked={isPanelMinAnswers}
          onChange={handleVisibilityMinPanel}
          id="checkboxRaspunsuriMinime"
        />
        <label class="form-check-label" for="checkboxRaspunsuriMinime">
          Selectare numar raspunsuri minime transmitere
        </label>
      </div>

      {isPanelMinAnswers && (
        <div className="d-flex flex-column align-items-start">
          <label class="form-check-label" for="raspunsuriMinime">
            Numar raspunsuri minime
          </label>
          <input
            class="form-input-green rounded"
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

      <div class="form-check">
        <input
          class="form-check-input form-input-green"
          type="checkbox"
          checked={isPanelExactAnswers}
          onChange={handleVisibilityExactPanel}
          id="checkboxRaspunsuriExacte"
        />
        <label class="form-check-label" for="checkboxRaspunsuriExacte">
          Selectare numar raspunsuri exacte transmitere
        </label>
      </div>

      {isPanelExactAnswers && (
        <div className="d-flex flex-column align-items-start">
          <label class="form-check-label" for="raspunsuriExacte">
            Numar raspunsuri exacte
          </label>
          <input
            class="form-input-green rounded"
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
        <div class="input-group d-flex flex-column">
          <label class="form-check-label mt-3" for="textRaspunsInvalid">
            Text raspuns invalid
          </label>
          <input
            type="text"
            class="form-control form-input-green mt-1"
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
