// Убедимся, что DOM загружен перед тем, как вешать обработчики
document.addEventListener('DOMContentLoaded', () => {

    // === Иерархии аллелей для сортировки и определения доминантности ===
    const hierarchyA = ['DY', 'SY', 'BS', 'at', 'a'];
    const hierarchyE = ['Em', 'E', 'e'];
    const hierarchyK = ['Kb', 'k'];

    // === Карта соответствия фенотипов и файлов изображений ===
    // Ключи ДОЛЖНЫ ТОЧНО совпадать с тем, что возвращает getPhenotype
    // Значения - пути к вашим PNG файлам в папке images
    const phenotypeImageMap = {
        "(выберите все аллели)": "images/placeholder.png",
        "Рецессивный рыжий (Бело-рыжий)": "images/recessive_red.png",
        "Доминантный черный (Бело-черный)": "images/dominant_black.png",
        "Доминантный рыжий (Бело-соболиный)": "images/dy_sable_no_mask.png",
        "Доминантный рыжий с маской (Бело-соболиный)": "images/dy_sable_masked.png",
        "Зачерненный рыжий (Бело-соболиный)": "images/sy_sable_no_mask.png",
        "Зачерненный рыжий с маской (Бело-соболиный)": "images/sy_sable_masked.png",
        "Чепрачный (Триколор)": "images/saddle_no_mask.png",
        "Чепрачный с маской (Триколор)": "images/saddle_masked.png",
        "Черно-подпалый (Триколор)": "images/tricolor_no_mask.png",
        "Черно-подпалый с маской (Триколор)": "images/tricolor_masked.png",
        "Рецессивный черный (Бело-черный)": "images/recessive_black.png",
        "placeholder": "images/placeholder.png" // Запасной вариант
    };


    // === Вспомогательная функция сортировки аллелей в генотипе ===
    function sortAlleles(a1, a2, hierarchy) {
        if (!a1 || !a2 || a1 === "" || a2 === "") return null;
        const index1 = hierarchy.indexOf(a1);
        const index2 = hierarchy.indexOf(a2);
        if (index1 === -1 || index2 === -1) return null;
        return index1 <= index2 ? [hierarchy[index1], hierarchy[index2]] : [hierarchy[index2], hierarchy[index1]];
    }

    // === Функция определения фенотипа по генотипу ===
    function getPhenotype(allelesA, allelesE, allelesK) {
        const sortedA = sortAlleles(allelesA[0], allelesA[1], hierarchyA);
        const sortedE = sortAlleles(allelesE[0], allelesE[1], hierarchyE);
        const sortedK = sortAlleles(allelesK[0], allelesK[1], hierarchyK);

        if (!sortedA || !sortedE || !sortedK) {
            return "(выберите все аллели)";
        }

        const genotypeE = `${sortedE[0]}/${sortedE[1]}`;
        const genotypeK = `${sortedK[0]}/${sortedK[1]}`;

        // 1. Проверяем рецессивный рыжий (e/e)
        if (genotypeE === 'e/e') {
            return "Рецессивный рыжий (Бело-рыжий)";
        }

        // 2. Проверяем доминантный черный (Kb/_)
        const hasKb = sortedK[0] === 'Kb';
        if (hasKb) {
            // Независимо от 'a' и 'Em', фенотип - доминантный черный
            return "Доминантный черный (Бело-черный)";
        }

        // 3. Если не e/e и не Kb/_ (т.е. генотип k/k), смотрим на локус А
        const hasEm = sortedE[0] === 'Em';
        const dominantA = sortedA[0];
        const maskText = hasEm ? " с маской" : "";

        switch (dominantA) {
            case 'DY': return `Доминантный рыжий${maskText} (Бело-соболиный)`;
            case 'SY': return `Зачерненный рыжий${maskText} (Бело-соболиный)`;
            case 'BS': return `Чепрачный${maskText} (Триколор)`;
            case 'at': return `Черно-подпалый${maskText} (Триколор)`;
            case 'a': return "Рецессивный черный (Бело-черный)"; // a/a k/k
            default: return "(ошибка в аллелях A)";
        }
    }

    // === Обновление отображения фенотипа родителя (текст + картинка) ===
    function updateParentPhenotype(parentIdPrefix) {
        const allelesA = [
            document.getElementById(`${parentIdPrefix}_a_1`).value,
            document.getElementById(`${parentIdPrefix}_a_2`).value
        ];
        const allelesE = [
            document.getElementById(`${parentIdPrefix}_e_1`).value,
            document.getElementById(`${parentIdPrefix}_e_2`).value
        ];
        const allelesK = [
            document.getElementById(`${parentIdPrefix}_k_1`).value,
            document.getElementById(`${parentIdPrefix}_k_2`).value
        ];

        const allSelected = allelesA[0] && allelesA[1] && allelesE[0] && allelesE[1] && allelesK[0] && allelesK[1];
        const phenotypeDisplay = document.getElementById(`${parentIdPrefix}_phenotype`);
        const phenotypeImage = document.getElementById(`${parentIdPrefix}_phenotype_image`); // Получаем img элемент

        let phenotype = "(выберите все аллели)"; // Значение по умолчанию

        if (allSelected) {
            phenotype = getPhenotype(allelesA, allelesE, allelesK);
        }

        phenotypeDisplay.textContent = `Окрас ${parentIdPrefix === 'mother' ? 'матери' : 'отца'}: ${phenotype}`;
        // Устанавливаем картинку
        phenotypeImage.src = phenotypeImageMap[phenotype] || phenotypeImageMap.placeholder; // Используем карту или placeholder
        phenotypeImage.alt = phenotype; // Обновляем alt текст
    }


    // === Назначаем обработчики на все select для обновления фенотипа родителя ===
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', (event) => {
            const selectId = event.target.id;
            if (selectId.startsWith('mother_')) {
                updateParentPhenotype('mother');
            } else if (selectId.startsWith('father_')) {
                updateParentPhenotype('father');
            }
        });
    });

    // === Инициализация отображения фенотипов родителей при загрузке страницы ===
    updateParentPhenotype('mother');
    updateParentPhenotype('father');

    // === Логика расчета потомства при нажатии на кнопку ===
    const calculateButton = document.getElementById('calculate-button');
    const resultsList = document.getElementById('results-list');

    calculateButton.addEventListener('click', () => {
        resultsList.innerHTML = ''; // Очищаем предыдущие результаты

        // --- Шаг 1: Получаем генотипы родителей и проверяем, все ли выбрано ---
        const motherAlleles = {
            A: [document.getElementById('mother_a_1').value, document.getElementById('mother_a_2').value],
            E: [document.getElementById('mother_e_1').value, document.getElementById('mother_e_2').value],
            K: [document.getElementById('mother_k_1').value, document.getElementById('mother_k_2').value]
        };
        const fatherAlleles = {
            A: [document.getElementById('father_a_1').value, document.getElementById('father_a_2').value],
            E: [document.getElementById('father_e_1').value, document.getElementById('father_e_2').value],
            K: [document.getElementById('father_k_1').value, document.getElementById('father_k_2').value]
        };

        const allSelectedAlleles = [
            ...motherAlleles.A, ...motherAlleles.E, ...motherAlleles.K,
            ...fatherAlleles.A, ...fatherAlleles.E, ...fatherAlleles.K
        ];
        const anyAlleleMissing = allSelectedAlleles.some(allele => allele === "");

        if (anyAlleleMissing) {
            resultsList.innerHTML = '<li>Пожалуйста, выберите все аллели для обоих родителей.</li>';
            return;
        }

        // --- Шаг 2: Генерируем возможные гаметы для каждого родителя ---
        function getGametes(parentAlleles) {
            const gametes = [];
            for (const alleleA of parentAlleles.A) {
                for (const alleleE of parentAlleles.E) {
                    for (const alleleK of parentAlleles.K) {
                        gametes.push({ A: alleleA, E: alleleE, K: alleleK });
                    }
                }
            }
            const uniqueGametes = Array.from(new Set(gametes.map(g => JSON.stringify(g)))).map(s => JSON.parse(s));
            return uniqueGametes;
        }

        const motherGametes = getGametes(motherAlleles);
        const fatherGametes = getGametes(fatherAlleles);

        // --- Шаг 3: Комбинируем гаметы для получения генотипов потомства ---
        const offspringGenotypes = [];
        for (const mGamete of motherGametes) {
            for (const fGamete of fatherGametes) {
                const offspringGeno = {
                    A: [mGamete.A, fGamete.A],
                    E: [mGamete.E, fGamete.E],
                    K: [mGamete.K, fGamete.K]
                };
                offspringGenotypes.push(offspringGeno);
            }
        }

        // --- Шаг 4: Определяем фенотипы потомства и считаем их количество ---
        const phenotypeCounts = {};
        for (const genotype of offspringGenotypes) {
            const phenotype = getPhenotype(genotype.A, genotype.E, genotype.K);
            phenotypeCounts[phenotype] = (phenotypeCounts[phenotype] || 0) + 1;
        }

        // --- Шаг 5: Рассчитываем вероятности и выводим результаты (с картинками) ---
        const totalCombinations = offspringGenotypes.length;
        if (totalCombinations === 0) {
             resultsList.innerHTML = '<li>Не удалось рассчитать потомство.</li>';
             return;
        }

        const phenotypeProbabilities = Object.entries(phenotypeCounts).map(([phenotype, count]) => {
            const probability = (count / totalCombinations) * 100;
            return [phenotype, probability];
        });

        phenotypeProbabilities.sort((a, b) => b[1] - a[1]); // Сортировка по убыванию вероятности

        phenotypeProbabilities.forEach(([phenotype, probability]) => {
            const listItem = document.createElement('li');

            const imgElement = document.createElement('img');
            imgElement.src = phenotypeImageMap[phenotype] || phenotypeImageMap.placeholder; // Берем путь из карты
            imgElement.alt = phenotype;
            // Не забываем добавить стили для img в CSS (уже должны быть из предыдущего шага)

            const textNode = document.createTextNode(`${phenotype}: ${probability.toFixed(2)}%`);

            listItem.appendChild(imgElement); // Добавляем картинку
            listItem.appendChild(textNode);   // Добавляем текст

            resultsList.appendChild(listItem);
        });

    }); // Конец обработчика click calculateButton

}); // Конец обработчика DOMContentLoaded