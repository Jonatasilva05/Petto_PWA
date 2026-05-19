function toggleSwitch(element) {
    const bg = element.querySelector('.toggle-bg');
    const circle = element.querySelector('.toggle-circle');
    const icon = element.querySelector('i');

    if (bg.classList.contains('bg-cyan-500')) {
    bg.classList.remove('bg-cyan-500'); bg.classList.add('bg-gray-300');
    icon.classList.remove('text-cyan-500'); icon.classList.add('text-gray-400');
    circle.classList.remove('ml-auto');
    } else {
    bg.classList.remove('bg-gray-300'); bg.classList.add('bg-cyan-500');
    icon.classList.remove('text-gray-400'); icon.classList.add('text-cyan-500');
    circle.classList.add('ml-auto');
    }
}