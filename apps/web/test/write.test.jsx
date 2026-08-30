import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import WriteToMe from '../src/sections/WriteToMe.jsx';

const EMAIL = 'rheanammindo@gmail.com';
const setup = () => act(async () => { render(<WriteToMe email={EMAIL} />); });

beforeEach(() => {
  delete window.location;
  window.location = { href: '' };
});

describe('the close', () => {
  it('opens as a half-written letter, not a form', async () => {
    await setup();
    expect(screen.getByText(/hey rheana/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/build me/i)).toBeInTheDocument();
  });

  // The address field is the part that feels like admin, so it stays away
  // until there is actually something to send.
  it('hides the address field until something has been written', async () => {
    await setup();
    expect(screen.queryByLabelText(/where do i reply/i)).toBeNull();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/build me/i), { target: { value: 'a dashboard' } });
    });
    expect(screen.getByLabelText(/where do i reply/i)).toBeInTheDocument();
  });

  it('offers prompts for anyone who does not want to compose', async () => {
    await setup();
    const prompts = screen.getAllByRole('button').filter(b => b.className.includes('write__prompt'));
    expect(prompts.length).toBe(3);
  });

  it('fills the sentence when a prompt is chosen', async () => {
    await setup();
    const prompt = screen.getAllByRole('button').find(b => b.className.includes('write__prompt'));
    await act(async () => { prompt.click(); });
    expect(screen.getByLabelText(/build me/i).value).toBe(prompt.textContent);
  });
});

describe('sending', () => {
  // With no endpoint configured the message must still reach her. Silently
  // dropping someone's enquiry is the worst possible failure for this section.
  it('falls back to a pre-filled email when no endpoint is set', async () => {
    await setup();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/build me/i), { target: { value: 'a dashboard' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/where do i reply/i), { target: { value: 'a@b.com' } });
    });
    await act(async () => { fireEvent.submit(document.querySelector('.write__form')); });

    expect(window.location.href).toContain(`mailto:${EMAIL}`);
    expect(decodeURIComponent(window.location.href)).toContain('a dashboard');
  });

  it('does nothing when the sentence is empty', async () => {
    await setup();
    await act(async () => { fireEvent.submit(document.querySelector('.write__form')); });
    expect(window.location.href).toBe('');
  });

  it('confirms once it has gone', async () => {
    await setup();
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/build me/i), { target: { value: 'a dashboard' } });
    });
    await act(async () => { fireEvent.submit(document.querySelector('.write__form')); });
    expect(screen.getByText(/first step done/i)).toBeInTheDocument();
  });
});

describe('voice', () => {
  // The close should ask the reader for their problem, not announce hers.
  it('never describes her in the closing copy', async () => {
    await setup();
    const text = document.body.textContent.toLowerCase();
    for (const word of ['developer', 'experienced', 'passionate', 'skilled']) {
      expect(text, `closing copy says "${word}"`).not.toContain(word);
    }
  });
});
