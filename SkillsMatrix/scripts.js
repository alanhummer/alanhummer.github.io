document.addEventListener('DOMContentLoaded', () => {
    const ranges = document.querySelectorAll('input[type="range"]');

    ranges.forEach(range => {
        range.addEventListener('input', () => {
            console.log(`${range.name}: ${range.value}`);
        });
    });
});
