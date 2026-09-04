import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RichText from '../src/lib/richText.jsx';
import { decodeEntities } from '../src/lib/richText.jsx';

describe('richText', () => {
  it('renders strong as a real element, not literal text', () => {
    render(<p><RichText>{'Shipped <strong>2,320 merged PRs</strong> total'}</RichText></p>);
    expect(screen.getByText('2,320 merged PRs').tagName).toBe('STRONG');
  });

  it('renders em as a real element', () => {
    render(<p><RichText>{'Author, <em>Quantifying Bias</em>'}</RichText></p>);
    expect(screen.getByText('Quantifying Bias').tagName).toBe('EM');
  });

  it('decodes entities so ampersands do not render as &amp;', () => {
    render(<p data-testid="t"><RichText>{'QA &amp; Automation'}</RichText></p>);
    expect(screen.getByTestId('t')).toHaveTextContent('QA & Automation');
  });

  it('decodes entities inside a tag too', () => {
    render(<p><RichText>{'<strong>Ads &amp; Attribution</strong>'}</RichText></p>);
    expect(screen.getByText('Ads & Attribution').tagName).toBe('STRONG');
  });

  it('treats any other tag as literal text rather than executing it', () => {
    render(<p data-testid="t"><RichText>{'<img src=x onerror=alert(1)>'}</RichText></p>);
    const el = screen.getByTestId('t');
    expect(el.querySelector('img')).toBeNull();
    expect(el).toHaveTextContent('<img src=x onerror=alert(1)>');
  });

  it('handles several tags in one string', () => {
    render(<p data-testid="t">
      <RichText>{'A <strong>b</strong> c <strong>d</strong> e'}</RichText>
    </p>);
    expect(screen.getByTestId('t').querySelectorAll('strong')).toHaveLength(2);
  });

  it('returns null for empty input', () => {
    render(<p data-testid="t"><RichText>{''}</RichText></p>);
    expect(screen.getByTestId('t')).toBeEmptyDOMElement();
  });

  it('decodeEntities leaves unknown entities alone', () => {
    expect(decodeEntities('a &zzz; b')).toBe('a &zzz; b');
  });
});
