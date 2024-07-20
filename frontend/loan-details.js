document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const loanId = urlParams.get('id');
    let loanData = {};

    function fetchLoanDetails() {
        fetch(`/loans/${loanId}`)
            .then(response => response.json())
            .then(data => {
                console.log('Loan details fetched:', data);  // Log loan details
                loanData = data;
                document.getElementById('loan-name').textContent = `Detalles del Préstamo: ${data.name}`;
                document.getElementById('loan-period').value = data.months_paid;
                generateCalendar(data.start_date, data.months_paid, data.cuota);
            });
    }

    window.generateCalendar = function(startDate, monthsPaid, cuota) {
        const period = parseInt(document.getElementById('loan-period').value, 10);
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        
        if (!startDate) {
            console.error('Start date is undefined');
            return;
        }

        const start = new Date(startDate);
        console.log('Start date:', startDate, 'Parsed start date:', start);  // Log start date
        let total = 0;

        for (let i = 0; i < period; i++) {
            const paymentDay = new Date(start);
            paymentDay.setMonth(paymentDay.getMonth() + i);
            console.log('Payment day:', paymentDay);  // Log payment day

            if (!isValidDate(paymentDay)) {
                console.log('Invalid date detected:', paymentDay);  // Log invalid date
                calendar.innerHTML += `
                    <div class="card mb-2 bg-light text-dark">
                        <div class="card-body">
                            <h5 class="card-title">Fecha inválida</h5>
                            <p class="card-text">Pendiente</p>
                        </div>
                    </div>
                `;
                continue;
            }

            const monthPaid = i < monthsPaid ? 'Pagado' : 'Pendiente';
            const formattedDate = paymentDay.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            calendar.innerHTML += `
                <div class="card mb-2 bg-light text-dark">
                    <div class="card-body">
                        <h5 class="card-title">${formattedDate}</h5>
                        <p class="card-text">${monthPaid}</p>
                    </div>
                </div>
            `;
            total += monthPaid === 'Pagado' ? cuota : 0;
        }
        console.log('Total paid:', total);  // Log total paid
        document.getElementById('total-amount').textContent = `Total Pagado: $${total.toFixed(2)}`;
    };

    document.querySelector('button.btn-primary').addEventListener('click', function() {
        generateCalendar(loanData.start_date, loanData.months_paid, loanData.cuota);
    });

    function isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }

    fetchLoanDetails();
});
