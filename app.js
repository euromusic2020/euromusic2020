$(document).ready(function () {
    setFilters();
    stopLoading();
    removeCorepetitor();
    setValidationMessages();
    addTeachers();
    $('#myForm')
        .on('submit', function (e) {
            // Prevent form submission
            e.preventDefault();
            setCorrectValues();

            // Get the form instance
            var $form = $(e.target);
            $form.validate();
            // Use Ajax to submit form data
            var url = 'https://script.google.com/macros/s/AKfycbzVsKz5dlnb_69A7F0E5wqBVApz6dfP9dTPsNQ_bPF1IZPsgcw/exec';
            console.log('data: ', $form.serialize());
            // Show Loading
            startLoading();

            var jqxhr = $.get(url, $form.serialize(), function (data) {
                    console.log("Success! Data: ", data);
                    goTo(6);
                    stopLoading();
                })
                .fail(function (data) {
                    console.warn("Error! Data: ", data);
                    // HACK - check if browser is Safari - and redirect even if fail b/c we know the form submits.
                    if (navigator.userAgent.search("Safari") >= 0 || navigator.userAgent.search("Chrome") >= 0) {
                        goTo(6);
                        // alert("Browser is Safari -- we get an error, but the form still submits -- continue.");             
                    } else {
                        goTo(7);
                    }
                    stopLoading();
                });

            $.post('https://147.175.121.210:4436/01/EMserver/', {'prihlaska': $form.serialize()}, (response) => {
                console.log('response from php: ', response);
            })
        });
}).on('keydown', function (event) {
    if ($(event.target).is('input')) {
        return;
    }
    currentPosition = ($('.tab-switch').index($('.tab-switch:checked')));
    switch (event.which) {
        case 39: // right arrow
            if (currentPosition > 4) {
                break;
            }
            $('.arrow-next')[0].focus();
            goTo(currentPosition + 1);
            event.preventDefault();
            break;
        case 37: // left arrow
            if (currentPosition !== 0) {
                goTo(currentPosition - 1);
                event.preventDefault();
                $('.arrow-prev')[0].focus();
            }
            break;
    }
});

let currentPosition;

$('input:not(.tab-switch)').on('keydown', function (event) {
    let index = $("input:not(.tab-switch)").index(this);
    const lastInputs = [4, 5, 9, 12, 15, 16];
    switch (event.which) {
        case 13:
            event.preventDefault();
            if (lastInputs.indexOf(index) !== -1 && currentPosition < 5) {
                console.log('go to ', currentPosition + 1);
                goTo(currentPosition + 1);
                this.blur();
                break;
            }
            if ($(this).is('input[type="date"], input[type="time"]')) {
                $("input:not(.tab-switch)").eq(index + 1).focus();
            }
            case 40: // down
                if ($(this).is('input[type="date"], input[type="time"]')) {
                    break;
                }
                $("input:not(.tab-switch)").eq(index + 1).focus();
                break;
            case 38: //up
                if ($(this).is('input[type="date"], input[type="time"]')) {
                    break;
                }
                if (index !== 0) {
                    $("input:not(.tab-switch)").eq(index - 1).focus();
                }
                break;

    }
});

function setCorrectValues() {
    $('#age').val(_calculateAge(new Date($('#birth_date').val()), getDate($('#day_of_competition').val())));
    $('#length_1').val($('#length_1').val().substr(0, 5));
    $('#length_2').val($('#length_2').val().substr(0, 5));
    $('#length_3').val($('#length_3').val().substr(0, 5));
    $('#total_length').val(_calculateDuration([$('#length_1').val(), $('#length_2').val(), $('#length_3').val()]));

}
let switches = document.getElementsByClassName('tab-switch');

function goTo(position) {
    currentPosition = ($('.tab-switch').index($('.tab-switch:checked')));
    if ($('.tab-switch')[position].disabled && currentPosition <= position) {
        let validMove = true;
        $('.tab-switch:checked').next().next().find('select').each(function () {
            if (!($(this).is(':valid'))) {
                validMove = false;
                $(this).valid();
            }
        });
        $('.tab-switch:checked').next().next().find('input').each(function () {
            if (!($(this).is(':valid')) && $(this)[0] !== $('#day_of_competition')[0]) {
                validMove = false;
                $(this).valid();
            }

        });
        // allow move to success/error tab
        if (position > 5) {
            validMove = true;
        }
        if (!validMove) {
            return;
        }
    }
    for (let i = 0; i < switches.length; i++) {
        if (switches[i].checked) {
            switches[i].checked = false;
        }
    }
    switches[position].checked = true;
    switches[position].disabled = false;
    $('.tab-switch:checked').next().next()[0].scrollIntoView();
    currentPosition++;
}

let selectedDate = document.getElementById('day_of_competition');
let categoriesElem = document.getElementById('category');

function changeCategory() {
    switch($('#category option:selected').val()) {
    case 'spev':
        $('#day_of_competition').val('12. máj 2021 (streda)')
        break;
    case 'klavir':
        $('#day_of_competition').val('17. máj 2021 (pondelok)')
        break;
    case 'akordeon':
    case 'dych':
        $('#day_of_competition').val('18. máj 2021 (utorok)')
        break;
    case 'gitara':
        $('#day_of_competition').val('21. máj 2021 (piatok)')
        break;
    default:
        console.log('somethings wrong: ', $('#category option:selected').val())
    }
    $(categoriesElem).valid();
    
}

function newOption(opt) {
    let option = document.createElement('option');
    option.text = opt;
    option.value = opt;
    return option;
}

function removeCorepetitor() {
    if (categoriesElem.value !== "spev" &&
        categoriesElem.value !== "dych") {
        $('#main-tab-content').removeClass('tab-content-XL');
        $('#main-tab-content').addClass('tab-content-L');
        $('#corepetitor-field').hide();
    } else {
        $('#main-tab-content').removeClass('tab-content-L');
        $('#main-tab-content').addClass('tab-content-XL');
        $('#corepetitor-field').show();
    }
}

function setFilters() {
    setInputFilter(document.getElementById("length_1"), function (value) {
        return /^\d*\:?\d*$/.test(value); // Allow digits and ':' only, using a RegExp
    });
    setInputFilter(document.getElementById("length_2"), function (value) {
        return /^\d*\:?\d*$/.test(value); // Allow digits and ':' only, using a RegExp
    });
    setInputFilter(document.getElementById("length_3"), function (value) {
        return /^\d*\:?\d*$/.test(value); // Allow digits and ':' only, using a RegExp
    });
}

function startLoading() {
    $('.arrow').hide();
    $('.lds-spinner').show();
    $('#container').addClass('overlay');
}

function stopLoading() {
    $('.arrow').show();
    $('.lds-spinner').hide();
    $('#container').removeClass('overlay');
}

function setValidationMessages() {
    jQuery.extend(jQuery.validator.messages, {
        required: "Toto pole je povinné.",
        remote: "Prosím opravte toto pole.",
        email: "Zadajte validnú emailovú adresu.",
        date: "Zadajte platný dátum.",
        dateISO: "Zadajte platný dátum.",
        number: "Zadajte číslo.",
        digits: "Zadajte iba číslice.",
        max: jQuery.validator.format("Prosím zadajte hodnotu menšiu ako {0}."),
        min: jQuery.validator.format("Prosím zadajte hodnotu väčšiu ako {0}."),
        minlength: "Zadajte dĺžku v správnom formáte: mm:ss"
    });
}

function _calculateDuration(inputs) {
    let totalSeconds = 0;
    inputs.forEach(input => {
        const minutes = input.split(':')[0];
        const seconds = input.split(':')[1];
        totalSeconds += parseInt(seconds) + 60 * parseInt(minutes);
    })
    let totalMinutes = totalSeconds / 60;
    totalSeconds = totalSeconds % 60;
    return Math.floor(totalMinutes) + ':' + (totalSeconds >= 10 ? totalSeconds : '0' + totalSeconds);
}

function _calculateAge(birthday, competitionDay) { // birthday is a date
    console.log('calculating age...')
    var ageDifMs = competitionDay.getTime() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    console.log('age: ', Math.abs(ageDate.getUTCFullYear() - 1970))
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function getDate(date) {
    console.log('get date from ', date, new Date('05/' + date.split('.')[0] + '/2021'))
    return new Date('05/' + date.split('.')[0] + '/2021');
}

function formatInput(event) {
    let $target = $(event.target);
    const currValue = $target.val();
    if ($target.val().match(/^\d{2}$/)) {
        $target.val(currValue + ':');
    }
}

// Restricts input for the given textbox to the given inputFilter function.
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
        textbox.addEventListener(event, function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    });
}

$.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

function addTeachers() {
    const teachers = [
        'Babinská Lenka',
        'Bačkor Miroslav',
        'Fulla Ján',
        'Glembová Lívia',
        'Glovaťáková Jana',
        'Gottsteinová Dana',
        'Halušková Monika',
        'Hrbčeková Jana',
        'Jánošová Anna',
        'Khakimova Azhar',
        'Kočalka Tomáš',
        'Kochlicová Dominika',
        'Kožuch Patrik',
        'Król Michal',
        'Kuruc Miroslav',
        'Lajčiak František',
        'Maga Benjamín',
        'Mišenko Jozef',
        'Mliečková Katarína',
        'Mudička Juraj',
        'Mudičková Miroslava',
        'Pašková Monika',
        'Poledňa Miroslav',
        'Procházková Martina',
        'Púčeková Lucia',
        'Pudišová Katarína',
        'Slavkovská Ivana',
        'Timková Terézia',
        'Uličný Tomáš',
        'Žufka Jordán',
    ];
    $.each(teachers, function(i, p) {
        $('#teacher').append($('<option></option>').val(p).html(p));
    });
}