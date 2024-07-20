document.addEventListener('DOMContentLoaded', function() {
    const addLoanForm = document.getElementById('add-loan-form');
    const editLoanForm = document.getElementById('edit-loan-form');

    function fetchLoans() {
        fetch('/loans')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.getElementById('loans-table-body');
                const loansCards = document.getElementById('loans-cards');
                tableBody.innerHTML = '';
                loansCards.innerHTML = '';
                data.forEach(loan => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><a href="loan-details.html?id=${loan.id}">${loan.name}</a></td>
                        <td>${loan.capital}</td>
                        <td>${loan.abonos}</td>
                        <td>${loan.porcentaje}</td>
                        <td>${loan.cuota}</td>
                        <td>${loan.start_date}</td>
                        <td>${loan.payment_date}</td>
                        <td>${loan.months_paid}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editLoan(${loan.id})" data-toggle="modal" data-target="#edit-loan-modal">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteLoan(${loan.id})">Eliminar</button>
                        </td>
                    `;
                    tableBody.appendChild(row);

                    const card = document.createElement('div');
                    card.classList.add('col-12', 'mb-3');
                    card.innerHTML = `
                        <div class="card bg-dark text-white">
                            <div class="card-body">
                                <h5 class="card-title"><a href="loan-details.html?id=${loan.id}" class="text-white">${loan.name}</a></h5>
                                <p class="card-text">Capital: ${loan.capital}</p>
                                <p class="card-text">Abonos: ${loan.abonos}</p>
                                <p class="card-text">Porcentaje: ${loan.porcentaje}</p>
                                <p class="card-text">Cuota Mensual: ${loan.cuota}</p>
                                <p class="card-text">Fecha de Inicio: ${loan.start_date}</p>
                                <p class="card-text">Fecha de Pago: ${loan.payment_date}</p>
                                <p class="card-text">Meses Pagados: ${loan.months_paid}</p>
                                <button class="btn btn-warning btn-sm" onclick="editLoan(${loan.id})" data-toggle="modal" data-target="#edit-loan-modal">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLoan(${loan.id})">Eliminar</button>
                            </div>
                        </div>
                    `;
                    loansCards.appendChild(card);
                });
            });
    }

    function calculateMonthlyPayment(capital, porcentaje) {
        return (capital * (porcentaje / 100)).toFixed(2);
    }

    addLoanForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const capital = parseFloat(formData.get('capital'));
        const porcentaje = parseFloat(formData.get('porcentaje'));
        const cuota = calculateMonthlyPayment(capital, porcentaje);

        const data = {
            name: formData.get('name'),
            capital: capital,
            abonos: 0,
            porcentaje: porcentaje,
            cuota: cuota,
            start_date: formData.get('start_date'),
            payment_date: formData.get('payment_date'),
            months_paid: parseInt(formData.get('months_paid'), 10)
        };

        fetch('/loans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.message === "Préstamo registrado exitosamente") {
                fetchLoans();
                $('#add-loan-modal').modal('hide');
                addLoanForm.reset();
            } else {
                alert(result.message);
            }
        });
    });

    editLoanForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const loanId = document.getElementById('edit-loan-id').value;
        const abonos = parseFloat(formData.get('abonos'));
        const months_paid = parseInt(formData.get('months_paid'), 10);
        const start_date = formData.get('start_date');
        const new_payment_date = new Date(start_date);
        new_payment_date.setMonth(new_payment_date.getMonth() + months_paid);
        const new_payment_date_str = new_payment_date.toISOString().split('T')[0];

        const data = {
            abonos: abonos,
            start_date: start_date,
            payment_date: new_payment_date_str,
            months_paid: months_paid
        };

        fetch(`/loans/${loanId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.message === "Préstamo actualizado exitosamente") {
                fetchLoans();
                $('#edit-loan-modal').modal('hide');
            } else {
                alert(result.message);
            }
        });
    });

    window.editLoan = function(loanId) {
        fetch(`/loans/${loanId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('edit-loan-id').value = data.id;
                document.getElementById('edit-abonos').value = data.abonos;
                document.getElementById('edit-start_date').value = data.start_date;
                document.getElementById('edit-payment_date').value = data.payment_date;
                document.getElementById('edit-months_paid').value = data.months_paid;
                $('#edit-loan-modal').modal('show');
            });
    };

    window.deleteLoan = function(loanId) {
        if (confirm('¿Estás seguro de que deseas eliminar este préstamo?')) {
            fetch(`/loans/${loanId}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(result => {
                if (result.message === "Préstamo eliminado exitosamente") {
                    fetchLoans();
                } else {
                    alert(result.message);
                }
            })
            .catch(error => console.error('Error:', error));
        }
    };

    fetchLoans();
});
