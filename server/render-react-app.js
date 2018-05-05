import * as React from 'react';
import {renderToString} from 'react-dom/server';
import HTML from '@shopify/react-html';

export default (ctx) => {
  const markup = renderToString(
    <HTML deferedScripts={[{path: 'bundle.js'}]}>
      <div>{'Hello React'}</div>
    </HTML>,
  );

  ctx.body = markup;
};
