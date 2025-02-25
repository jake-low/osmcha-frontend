// @flow
import React from 'react';

export function Home() {
  return (
    <div className="flex-parent flex-parent--column flex-parent--center-cross h-full">
      <div className="flex-child flex-child--grow">&nbsp;</div>
      <section
        className="py36"
        style={{
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '1em'
        }}
      >
        <p>
          <strong>This is a preview version of OSMCha.</strong> Significant
          changes include:
        </p>
        <ul className="pl24" style={{ listStyleType: 'initial' }}>
          <li>
            The frontend uses MapLibre and{' '}
            <code>@osmcha/maplibre-adiff-viewer</code> to render changesets,
            rather than <code>changeset-map</code>
          </li>
          <li>
            Changeset data is fetched from <code>adiffs.osmcha.org</code> rather
            than from the <code>real-changesets</code> S3 bucket
          </li>
        </ul>
        <p>
          To try out this version of OSMCha, you'll need to "log in" using an
          ugly hack. Follow these steps:
        </p>
        <ol className="pl24" style={{ listStyleType: 'initial' }}>
          <li>
            Go to <a href="https://osmcha.org">https://osmcha.org</a>, and open
            your browser's DevTools
          </li>
          <li>
            Run <code>localStorage.getItem("token")</code> in the console and
            copy the resulting string
          </li>
          <li>
            Return to this page, open the DevTools, and run{' '}
            <code>localStorage.setItem("token", &lt;copied value&gt;)</code>
          </li>
          <li>Refresh the page. You should now be logged in.</li>
        </ol>
      </section>
      <div className="flex-child flex-child--grow">&nbsp;</div>
    </div>
  );
}
