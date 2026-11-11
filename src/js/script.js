
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
let slipNumber = '';
let currentStep = 1;

let submissionLocked = false;
let cancellationLocked = false;
let currentAppointment = null;

const app = document.querySelector('#app');

const toothIcon = `
  <svg aria-hidden="true" class="tooth-icon" viewBox="0 0 32 32" fill="none">
    <path
      d="M8.2 5.9c2.2-1.3 4.3-.2 5.4.3.9.4 1.7.4 2.5 0 1.1-.5 3.2-1.6 5.5-.3 2.9 1.7 3 5.5 2.1 8.3-.7 2.2-2.1 3.8-2.7 6-.8 2.8-.7 6-2.8 6.2-2.6.3-2-6.7-4.3-6.7s-1.7 7-4.3 6.7c-2.1-.2-2-3.4-2.8-6.2-.6-2.2-2-3.8-2.7-6-.9-2.8-.8-6.6 2.1-8.3Z"
      fill="currentColor"
    />
  </svg>
`;

const successIcon = `
  <svg aria-hidden="true" class="success-icon" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="4"/>
    <path
      d="m20 32 8 8 18-20"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`;

function renderHomePage() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    <section class="intro">
      <h1>Welcome to Our Dental Clinic</h1>
      <p>Your smile matters to us. Book your dental appointment today.</p>
    </section>

    <section class="appointment-card home-card">
      <h2>Dental Clinic Appointment System</h2>

      <p class="selected-service">
        Schedule your appointment with our available dentists
        quickly and conveniently.
      </p>

      <button
        type="button"
        class="confirm-button"
        id="book-appointment-button"
      >
        BOOK APPOINTMENT
      </button>
    </section>
  `;

  document
    .querySelector('#book-appointment-button')
    .addEventListener('click', startBooking);
}

function startBooking() {
  renderAppointmentStep();
}

function renderHeader() {
  return `
    <header class="site-header">
      <div class="header-content">
        <div class="brand-mark">${toothIcon}</div>
        <span>Dental Clinic Appointment System</span>
      </div>
    </header>
  `;
}

function renderAppointmentSummary() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    <section class="appointment-card">
      <h2>Appointment Summary</h2>

      <div class="slip-box">
        <span>Appointment Slip Number</span>
        <strong>${currentAppointment.slipNumber}</strong>
      </div>

      <div class="slip-box">
        <span>Selected Dentist</span>
        <strong class="slip-detail">${currentAppointment.dentist}</strong>
      </div>

      <div class="slip-box">
        <span>Appointment Date</span>
        <strong class="slip-detail">${currentAppointment.date}</strong>
      </div>

      <div class="slip-box">
        <span>Appointment Time</span>
        <strong class="slip-detail">${currentAppointment.time}</strong>
      </div>

      <div class="slip-box">
        <span>Appointment Status</span>
        <strong class="slip-detail">
          ${currentAppointment.status}
        </strong>
      </div>

      <p class="validation-message" id="cancel-error" role="alert" hidden></p>

      <div class="summary-actions">
        <button
          type="button"
          class="confirm-button"
          id="cancel-appointment-button"
        >
          CANCEL APPOINTMENT
        </button>

        <button
          type="button"
          class="confirm-button"
          id="finish-button"
        >
          FINISH
        </button>
      </div>

      <button
        type="button"
        class="another-appointment-button"
        id="book-another-button"
      >
        Book Another Appointment
      </button>
    </section>
  `;

  document
    .querySelector('#cancel-appointment-button')
    .addEventListener('click', renderCancellationForm);

  document
  .querySelector('#finish-button')
  .addEventListener('click', renderThankYouPage);

  document
    .querySelector('#book-another-button')
    .addEventListener('click', backToHome);
}

function renderApp() {
  app.innerHTML = `
    <div class="app-shell">
      ${renderHeader()}

      <main class="page-content">
        <div id="step-content"></div>
      </main>

      <div id="modal-container"></div>
    </div>
  `;

  renderAppointmentStep();
}

function renderAppointmentStep() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
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

        <div class="form-navigation">
          <button type="submit" class="confirm-button">
            CONFIRM
          </button>
        </div>

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

async function handleSubmit(event) {
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

  submissionLocked = true;
  errorMessage.hidden = true;

  try {
    const { data, error } = await supabase.rpc(
      'create_appointment',
      {
        p_dentist_name: selectedDoctor,
        p_appointment_date: selectedDate,
        p_appointment_time: convertTo24Hour(selectedTime)
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

    currentAppointment = {
      slipNumber: data.slip_number,
      cancellationCode: data.cancellation_code,
      dentist: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      status: 'Booked'
    };

    showConfirmation(data);

  } catch (error) {
    console.error('Appointment Error:', error);

    errorMessage.textContent = error.message;
    errorMessage.hidden = false;

    submissionLocked = false;
  }
}

async function handleCancelAppointment(event) {
  event.preventDefault();

  if (cancellationLocked || !currentAppointment) return;

  const enteredCode = document
    .querySelector('#cancellation-code')
    .value.trim();

  const errorMessage = document.querySelector('#cancel-error');

  const cancelButton = document.querySelector(
    '#cancellation-form button[type="submit"]'
  );

  if (!enteredCode) {
    errorMessage.textContent = 'Please enter your cancellation code.';
    errorMessage.hidden = false;
    return;
  }

  cancellationLocked = true;
  cancelButton.disabled = true;
  cancelButton.textContent = 'CANCELLING...';
  errorMessage.hidden = true;

  console.log('Slip number being cancelled:', currentAppointment.slipNumber);
  console.log('Entered code length:', enteredCode.length);  

  try {
    const { data, error } = await supabase.rpc(
      'cancel_appointment',
      {
        p_slip_number: currentAppointment.slipNumber,
        p_cancellation_code: enteredCode
      }
    );

    console.log('Cancellation response:', data);
    console.log('Cancellation error:', error);

    if (error) {
      throw new Error(error.message);
    }

    if (data !== true) {
      throw new Error(
        'Invalid cancellation code or appointment cannot be cancelled.'
      );
    }

    currentAppointment.status = 'Cancelled';

    renderCancellationThankYouPage();

  } catch (error) {
    console.error('Cancellation Error:', error);

    errorMessage.textContent = error.message;
    errorMessage.hidden = false;

    cancellationLocked = false;
    cancelButton.disabled = false;
    cancelButton.textContent = 'CONFIRM CANCELLATION';
  }
}

function renderCancellationForm() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    <section class="appointment-card">
      <button
        type="button"
        id="back-cancel-button"
      >
        BACK
      </button>

      <h2>Cancel Appointment</h2>

      <p class="selected-service">
        Enter your cancellation code to proceed.
      </p>

      <form id="cancellation-form">
        <label for="cancellation-code">Cancellation Code</label>

        <input
          id="cancellation-code"
          type="text"
          maxlength="10"
          placeholder="Enter your cancellation code"
          required
        />

        <p class="validation-message" id="cancel-error" role="alert" hidden></p>

        <div class="form-navigation">

          <button type="submit" class="confirm-button">
            CONFIRM CANCELLATION
          </button>
        </div>
      </form>
    </section>
  `;
  document
  .querySelector('#back-cancel-button')
  .addEventListener('click', renderAppointmentSummary);

  document
    .querySelector('#cancellation-form')
    .addEventListener('submit', handleCancelAppointment);
}
function renderCancellationThankYouPage() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
    <section class="appointment-card thank-you-card">
      <h1>THANK YOU!</h1>

      <p>
        Your appointment has been successfully cancelled.
        We hope to see you again soon!
      </p>

      <button
        type="button"
        class="another-appointment-button"
        id="back-home-button"
      >
        BACK TO BOOKING PAGE
      </button>
    </section>
  `;

  document
    .querySelector('#back-home-button')
    .addEventListener('click', backToHome);
}

function convertTo24Hour(time) {
  const [clock, period] = time.split(' ');
  let [hours, minutes] = clock.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}


function handleEscape(event) {
  if (event.key === 'Escape') {
    continueToSummary();
  }
}


function showConfirmation(appointment) {
  const modalContainer = document.querySelector('#modal-container');

  modalContainer.innerHTML = `
    <div class="modal-overlay" role="presentation">
      <section
        aria-labelledby="success-title"
        aria-describedby="success-message"
        aria-modal="true"
        class="confirmation-modal"
        role="dialog"
      >
        ${successIcon}

        <h2 id="success-title">Appointment Successfully Created!</h2>

        <div class="slip-box">
          <span>Appointment Slip Number</span>
          <strong>${appointment.slip_number}</strong>
        </div>

        <div class="slip-box">
          <span>Cancellation Code</span>
          <strong>${appointment.cancellation_code}</strong>
        </div>

        <p class="modal-message" id="success-message">
          Please present your appointment slip number to the front desk
          upon arrival at the clinic.
        </p>

        <p class="modal-message">
          IMPORTANT NOTICE: Keep a screenshot or save this slip.
          Your cancellation code will only be shown once.
          You will need it if you want to cancel your appointment.
        </p>

        <button class="ok-button" id="ok-button" type="button">
          OK
        </button>
      </section>
    </div>
  `;

  document.querySelector('#ok-button').focus();

  document.querySelector('#ok-button').addEventListener('click', () => {
    continueToSummary();
  });

  document.addEventListener('keydown', handleEscape);
}

function renderThankYouPage() {
  const stepContent = document.querySelector('#step-content');

  stepContent.innerHTML = `
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
        BACK TO BOOKING PAGE
      </button>
    </section>
  `;

  document
    .querySelector('#back-home-button')
    .addEventListener('click', backToHome);
}

function backToHome() {
  selectedDoctor = doctors[0];
  selectedDate = '';
  selectedTime = '08:00 AM';

  currentAppointment = null;

  submissionLocked = false;
  cancellationLocked = false;

  renderAppointmentStep();
}

renderApp();
async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('Appointments')
    .select('appointment_id')
    .limit(1);

  if (error) {
    console.error('Supabase connection error:', error.message);
    return;
  }

  console.log('Supabase connected successfully!', data);
}
function continueToSummary() {
  document.removeEventListener('keydown', handleEscape);

  const modalContainer = document.querySelector('#modal-container');
  modalContainer.innerHTML = '';

  renderAppointmentSummary();
}


testSupabaseConnection();