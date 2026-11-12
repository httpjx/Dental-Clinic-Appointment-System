
import { supabase } from './supabase.js';
const doctors = [
  'Dr. Ros Pernitez – Dentist',
  'Dr. Maria Santos – Dentist',
];

const appointmentTimes = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

let selectedDoctor = doctors[0];
let selectedDate = '';
let selectedTime = '08:00 AM';
let submissionLocked = false;

const app = document.querySelector('#app');


function renderHomePage() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    <section class="welcome-page">
      <div class="welcome-content">

        <div class="welcome-logo">
          <svg
            class="tooth-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3.5c-2.2-1.5-5.5-1.2-7.1.8-1.5 1.9-.8 5.2.1 7.6.8 2.2 1.7 7.2 3.6 7.2 1.5 0 1.3-5.1 3.4-5.1s1.9 5.1 3.4 5.1c1.9 0 2.8-5 3.6-7.2.9-2.4 1.6-5.7.1-7.6-1.6-2-4.9-2.3-7.1-.8z"/>
          </svg>
        </div>

        <h1>Dental Clinic Appointment System</h1>

        <button
          type="button"
          class="welcome-button"
          id="book-appointment-button"
        >
          Book Your Appointment Now
        </button>

        <p>
          Use your smile to change the world,
          don't let the world change your smile.
        </p>

      </div>
    </section>
  `;

  document
    .querySelector('#book-appointment-button')
    .addEventListener('click', startBooking);
}

function startBooking() {
  renderAppointmentStep();
}

function renderAppointmentSummary() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    ${renderHeader()}

    <section class="appointment-card summary-card">
      <h2>Appointment Summary</h2>

      <div class="slip-box">
        <span>Selected Dentist</span>
        <strong class="slip-detail">${selectedDoctor}</strong>
      </div>

      <div class="slip-box">
        <span>Appointment Date</span>
        <strong class="slip-detail">${selectedDate}</strong>
      </div>

      <div class="slip-box">
        <span>Appointment Time</span>
        <strong class="slip-detail">${selectedTime}</strong>
      </div>

      <p class="validation-message" id="summary-error" role="alert" hidden></p>

      <div class="summary-actions">
        <button
          type="button"
          class="confirm-button"
          id="cancel-appointment-button"
        >
          CANCEL
        </button>

        <button
          type="button"
          class="confirm-button"
          id="confirm-appointment-button"
        >
          CONFIRM
        </button>
      </div>
    </section>
  `;

  document
    .querySelector('#cancel-appointment-button')
    .addEventListener('click', renderAppointmentStep);

  document
    .querySelector('#confirm-appointment-button')
    .addEventListener('click', confirmAppointment);
}

function renderApp() {
  app.innerHTML = `
    <div class="app-shell">
      <main id="step-content"></main>
    </div>
  `;

  renderHomePage();
}

function renderHeader() {
  return `
    <header class="site-header">
      <div class="header-content">
        <div class="brand-mark">
          <svg
            class="tooth-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3.5c-2.2-1.5-5.5-1.2-7.1.8-1.5 1.9-.8 5.2.1 7.6.8 2.2 1.7 7.2 3.6 7.2 1.5 0 1.3-5.1 3.4-5.1s1.9 5.1 3.4 5.1c1.9 0 2.8-5 3.6-7.2.9-2.4 1.6-5.7.1-7.6-1.6-2-4.9-2.3-7.1-.8z"/>
          </svg>
        </div>

        <span>Dental Clinic Appointment System</span>
      </div>
    </header>
  `;
}

function renderAppointmentStep() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    ${renderHeader()}

    <section class="appointment-card">
      <h2>Appointment Details</h2>

      <form id="appointment-form" novalidate>

        <label for="doctor">Select Doctor</label>

        <div class="select-wrap">
          <select id="doctor">
            ${doctors.map(name => `
              <option value="${name}" ${name === selectedDoctor ? 'selected' : ''}>
                ${name}
              </option>
            `).join('')}
          </select>
        </div>

        <label for="date">Appointment Date</label>

        <input
          id="date"
          type="date"
          lang="en-GB"
          min="${getManilaDateTime().date}"
          max="${getMaximumBookingDate()}"
          value="${selectedDate}"
          required
        />

        <label for="time">Appointment Time</label>

        <div class="select-wrap">
          <select id="time" required>
            <option value="">Select a time</option>
            ${appointmentTimes.map(time => `
              <option value="${time}" ${time === selectedTime ? 'selected' : ''}>
                ${time}
              </option>
            `).join('')}
          </select>
        </div>

        <p class="validation-message" id="appointment-error" role="alert" hidden></p>

          <button type="submit" class="confirm-button">
            CONTINUE
          </button>

      </form>
    </section>
  `;

  document.querySelector('#doctor').addEventListener('change', event => {
    selectedDoctor = event.target.value;
  });

  document.querySelector('#date').addEventListener('change', event => {
    selectedDate = event.target.value;
  });

  document.querySelector('#time').addEventListener('change', event => {
    selectedTime = event.target.value;
  });

  document.querySelector('#appointment-form').addEventListener('submit', handleSubmit);
}

function handleSubmit(event) {
  event.preventDefault();

  if (submissionLocked) return;

  selectedDoctor = document.querySelector('#doctor').value;
  selectedDate = document.querySelector('#date').value;
  selectedTime = document.querySelector('#time').value;

  const errorMessage = document.querySelector('#appointment-error');

  if (!selectedDoctor || !selectedDate || !selectedTime) {
    errorMessage.textContent =
      'Please complete all appointment fields before continuing.';
    errorMessage.hidden = false;
    return;
  }

  const { date: today, time: currentTime } = getManilaDateTime();
  const maximumDate = getMaximumBookingDate();
  const appointmentTime24 = convertTo24Hour(selectedTime);

  if (selectedDate < today || selectedDate > maximumDate) {
    errorMessage.textContent =
      'Appointments can only be booked within the next 12 months.';
    errorMessage.hidden = false;
    return;
  }

  if (
    selectedDate === today &&
    appointmentTime24.slice(0, 5) <= currentTime
  ) {
    errorMessage.textContent =
      'Please select a valid appointment time.';
    errorMessage.hidden = false;
    return;
  }

  errorMessage.hidden = true;

  renderAppointmentSummary();
}

async function confirmAppointment() {
  if (submissionLocked) return;

  submissionLocked = true;

  const errorMessage = document.querySelector('#summary-error');
  const confirmButton = document.querySelector('#confirm-appointment-button');

  confirmButton.disabled = true;
  confirmButton.textContent = 'CONFIRMING...';

  try {
    const { date: today, time: currentTime } = getManilaDateTime();
    const maximumDate = getMaximumBookingDate();
    const appointmentTime24 = convertTo24Hour(selectedTime);

    if (selectedDate < today || selectedDate > maximumDate) {
      throw new Error(
        'Appointments can only be booked within the next 12 months.'
      );
    }

    if (
      selectedDate === today &&
      appointmentTime24.slice(0, 5) <= currentTime
    ) {
      throw new Error('Please select a future appointment time.');
    }

    const { data, error } = await supabase.rpc(
      'create_appointment',
      {
        p_dentist_name: selectedDoctor,
        p_appointment_date: selectedDate,
        p_appointment_time: appointmentTime24
      }
    );

    if (error) {
      if (error.code === '23505') {
        throw new Error(
          'This dentist is already booked for the selected date and time. Please choose another time.'
        );
      }

      throw new Error(error.message);
    }

    console.log('Supabase appointment response:', data);

    renderAppointmentSlip(data);

  } catch (error) {
    console.error('Appointment Error:', error);

    errorMessage.textContent = error.message;
    errorMessage.hidden = false;

    submissionLocked = false;
    confirmButton.disabled = false;
    confirmButton.textContent = 'CONFIRM';
  }
}

function getManilaDateTime() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());

  const values = {};

  parts.forEach(part => {
    values[part.type] = part.value;
  });

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`
  };
}

function getMaximumBookingDate() {
  const { date } = getManilaDateTime();
  const [year, month, day] = date.split('-').map(Number);

  const maximumDate = new Date(Date.UTC(year, month - 1, day));
  maximumDate.setUTCFullYear(maximumDate.getUTCFullYear() + 1);

  return [
    maximumDate.getUTCFullYear(),
    String(maximumDate.getUTCMonth() + 1).padStart(2, '0'),
    String(maximumDate.getUTCDate()).padStart(2, '0')
  ].join('-');
}

function convertTo24Hour(time) {
  const [clock, period] = time.split(' ');
  let [hours, minutes] = clock.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

function renderAppointmentSlip(appointment) {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    ${renderHeader()}

    <section class="appointment-card">
      <h2>Appointment Successfully Created!</h2>

      <div class="slip-box">
        <span>Appointment Slip Number</span>
        <strong>${appointment.slip_number}</strong>
      </div>

      <p class="modal-message">
        Please take a screenshot of this appointment slip
        and present it at the front desk upon arrival.
      </p>

      <div class="summary-actions">
        <button
          type="button"
          class="confirm-button"
          id="book-another-button"
        >
          BOOK ANOTHER APPOINTMENT
        </button>

        <button
          type="button"
          class="confirm-button"
          id="finish-button"
        >
          FINISH
        </button>
      </div>
    </section>
  `;

  document
    .querySelector('#book-another-button')
    .addEventListener('click', backToHome);

  document
    .querySelector('#finish-button')
    .addEventListener('click', renderThankYouPage);
}

function renderThankYouPage() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    ${renderHeader()}

    <section class="appointment-card thank-you-card">
      <h1>THANK YOU!</h1>

      <p>
        Your appointment has been successfully completed.
        We look forward to seeing you!
      </p>

      <button
        type="button"
        class="another-appointment-button"
        id="back-home-button"
      >
        BACK TO HOME PAGE
      </button>
    </section>
  `;

  document
    .querySelector('#back-home-button')
    .addEventListener('click', () => {
      selectedDoctor = doctors[0];
      selectedDate = '';
      selectedTime = '08:00 AM';
      submissionLocked = false;

      renderHomePage();
  });
}

function backToHome() {
  selectedDoctor = doctors[0];
  selectedDate = '';
  selectedTime = '08:00 AM';

  submissionLocked = false;

  renderAppointmentStep();
}

renderApp();