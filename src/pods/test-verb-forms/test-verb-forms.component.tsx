import * as React from 'react';
import { Button } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import {
  Verb,
  VerbQuiz,
  createDefaultVerbQuiz,
  VerbCorrect,
  createDefaultVerbCorrect,
} from './test-verb-forms.vm';
import { Formik, Form, Field } from 'formik';
import { answerIsCorrect } from './test-verb-forms.business';
import { ShowResultsComponent } from 'common/components/show-results';
import * as classes from 'common/styles/tests.styles';
import { Pronunciation } from "common/components";

interface Props {
  currentQuestion: number;
  totalQuestions: number;
  onNextQuestion: () => void;
  verb: Verb;
  score: number;
  setScore: (value: number) => void;
  hasSecondChance: boolean;
}

export const TestVerbFormComponent: React.FC<Props> = props => {
  const {
    currentQuestion,
    totalQuestions,
    onNextQuestion,
    verb,
    score,
    setScore,
    hasSecondChance,
  } = props;
  const [verbCorrect, setVerbCorrect] = React.useState<VerbCorrect>(
    createDefaultVerbCorrect()
  );
  const [validated, setValidated] = React.useState(false);
  const [secondAttempt, setSecondAttempt] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);

  const [initialQuiz, setInitialQuiz] = React.useState<VerbQuiz>(
    createDefaultVerbQuiz()
  );
  const {
    title,
    mainContainer,
    inputContainer,
    backContainer,
    pictureContainer,
    picture,
    inputField,
    insideBtnContainer,
    nextBtn,
    arrowIcon,
  } = classes;

  const handleValidateAnswer = (isCorrect: VerbCorrect) => {
    if (isCorrect.all) {
      if (secondAttempt) {
        setScore(score + 0.5);
      } else {
        setScore(score + 1);
      }
    }
    setVerbCorrect(isCorrect);
    setValidated(true);
  };

  const internalHandleOnNextQuestion = () => {
    setInitialQuiz(createDefaultVerbQuiz());
    setValidated(false);
    setSecondAttempt(false);
    setVerbCorrect(createDefaultVerbCorrect());
    onNextQuestion();
  };

  const handleSecondAttempt = () => {
    setValidated(false);
    setSecondAttempt(true);
  };

  const textToSpeech = (): string => {
    if (verb.infinitive === 'read') { // Workaround for 'to read', using homophones
      return 'reed. red. red';
    }
    return `${verb.infinitive}. ${verb.past}. ${verb.participle}`;
  };

  return (
    <main className={mainContainer}>
      <h1 className={title}>
        {verb.translation} ({`${currentQuestion} / ${totalQuestions}`})
      </h1>
      <Formik
        onSubmit={(values, actions) => {
          const answerCorrection = answerIsCorrect(verb, values);
          setIsCorrect(answerCorrection.all);
          handleValidateAnswer(answerCorrection);
          if (!hasSecondChance || secondAttempt || answerCorrection.all) {
            actions.resetForm({ values: createDefaultVerbQuiz() });
          }
          if (hasSecondChance && !secondAttempt) {
            if (!answerCorrection.infinitive)
              actions.setFieldError('infinitive', 'Incorrect');
            if (!answerCorrection.past) actions.setFieldError('past', 'Incorrect');
            if (!answerCorrection.participle)
              actions.setFieldError('participle', 'Incorrect');
          }
        }}
        initialValues={initialQuiz}
      >
        {() => (
          <Form>
            {!validated && (
              <div className={backContainer}>
                <div className={pictureContainer}>
                  <img
                    className={picture}
                    src={`/assets/verb-images/${verb.infinitive}.png`}
                  ></img>
                </div>
                <div className={inputContainer}>
                  <div className={inputField}>
                    <label htmlFor="infinitive">Infinitive</label>
                    <Field
                      type="text"
                      name="infinitive"
                      id="infinitive"
                      autoComplete="off"
                    />
                  </div>
                  <div className={inputField}>
                    <label htmlFor="past">Past</label>
                    <Field
                      type="text"
                      name="past"
                      id="past"
                      autoComplete="off"
                    />
                  </div>
                  <div className={inputField}>
                    <label htmlFor="participle">Participle</label>
                    <Field
                      type="text"
                      name="participle"
                      id="participle"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <Pronunciation text={textToSpeech()} />
              </div>
            )}
            {validated &&
              (!hasSecondChance || secondAttempt || verbCorrect.all) ? (
              <>
                <ShowResultsComponent
                  isCorrect={isCorrect}
                  verb={verb}
                  showAnswer={true}
                />

                <Button
                  className={nextBtn}
                  onClick={internalHandleOnNextQuestion}
                  variant="contained"
                >
                  <div className={insideBtnContainer}>
                    <span>Next Verb</span>
                    <ArrowForwardIcon className={arrowIcon} />
                  </div>
                </Button>
              </>
            ) : validated && !secondAttempt ? (
              <>
                <ShowResultsComponent
                  isCorrect={isCorrect}
                  verb={verb}
                  showAnswer={false}
                />

                <Button
                  onClick={handleSecondAttempt}
                  variant="contained"
                  color="primary"
                >
                  Try again
                </Button>
              </>
            ) : (
              <>
                <Button
                  className={nextBtn}
                  type="submit"
                  variant="contained"
                  disableElevation
                >
                  <div className={insideBtnContainer}>
                    Next <ArrowForwardIcon className={arrowIcon} />
                  </div>
                </Button>
              </>
            )}
          </Form>
        )}
      </Formik>
    </main>
  );
};
