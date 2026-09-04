import { useI18n } from '../hooks/useI18n.jsx';

// One quiet way out of every section, pointing at the form.
//
// A visitor decides to write at an unpredictable moment: after the video for
// one person, after the recommendations for another. Making them scroll to the
// bottom to find the form loses whoever was ready three sections earlier.
//
// The restraint matters as much as the presence. This is a line of text and an
// arrow, not a coloured button repeated seven times - seven buttons reads as a
// landing page begging, and undoes the calm the rest of the page is built on.
// Each section says something different, because the same sentence seven times
// is wallpaper and stops being read.
//
// It points at #write rather than a mail client: the form is on this page, it
// is answered the same way, and it does not ask someone to leave the site and
// compose a subject line before they have said anything.

export default function SectionCta({ id }) {
  const { t } = useI18n();
  return (
    <p className="scta">
      <a className="scta__link" href="#write">
        {t(`cta.${id}`)}
        <span className="scta__arrow" aria-hidden="true"> &rarr;</span>
      </a>
    </p>
  );
}
