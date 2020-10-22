import React from 'react';
import DATACORE from 'modules/runtime-datacore';

/// import KEYWORD DEFINITIONS
import { DefTemplate, EndTemplate } from 'script/keywords/defTemplate';
import { DefProp } from 'script/keywords/defProp';
import { UseFeature } from 'script/keywords/useFeature';

// import the KEYWORD GENERATOR API from class
import { KEYGEN } from 'lib/class-keyword-helper';

/// add keywords to the KEYWORD dictionary
KEYGEN.AddKeywordHelper(EndTemplate);
KEYGEN.AddKeywordHelper(DefTemplate);
KEYGEN.AddKeywordHelper(DefProp);
KEYGEN.AddKeywordHelper(UseFeature);

/// get source lines (generated by script GUI)
const SOURCE = [
  'defTemplate Bee',
  'defProp nectarAmount GSNumber 0',
  'useFeature FishCounter',
  'useFeature BeanCounter',
  'useFeature Movement',
  'endTemplate'
];

/// generate template from source
const template = KEYGEN.CompileTemplate(SOURCE);
DATACORE.RegisterTemplate(template);

/// generate jsx from source (pseudocode)
const TemplateComponent = KEYGEN.RenderSource(SOURCE);
return <TemplateComponent />;
