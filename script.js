
    // Register Chart.js Datalabels plugin
    Chart.register(ChartDataLabels);

    const sheetUrl = window.APP_CONFIG.SHEET_URL;
    const hookUrl  = window.APP_CONFIG.HOOK_URL;
    const pricePerBottle = window.APP_CONFIG.PRICE_PER_BOTTLE;

    // elements
    const sold = document.getElementById('sold');
    const pending = document.getElementById('pending');
    const cleared = document.getElementById('cleared');
    const revenueOut = document.getElementById('revenue');

    const pipeFee = document.getElementById('pipeFee');
    const shareFee = document.getElementById('shareFee');
    const otherFee = document.getElementById('otherFee');
    const saveFee = document.getElementById('saveFee');
    const expenseOut = document.getElementById('expense');

    const balanceOut = document.getElementById('balance');
    const form = document.getElementById('saleForm');
    const msg = document.getElementById('msg');
    const dateInput = document.getElementById('date');
    const sheetBtn = document.getElementById('sheetBtn');
    const reportBtn = document.getElementById('reportBtn');
    const loadingOverlay = document.getElementById('loading');
    
    // Auto set today's date
    dateInput.value = new Date().toISOString().substr(0, 10);
    
    // --- Sales Form & Calculator Functions ---
    
    function calcRevenue() {
      const rev = (Number(sold.value) + Number(cleared.value) - Number(pending.value)) * pricePerBottle;
      revenueOut.textContent = rev.toLocaleString();
      return rev;
    }

    function calcExpense() {
      const exp = Number(pipeFee.value) + Number(shareFee.value) + Number(otherFee.value) + Number(saveFee.value);
      expenseOut.textContent = exp.toLocaleString();
      return exp;
    }

    function calcBalance() {
      const bal = calcRevenue() - calcExpense();
      balanceOut.textContent = bal.toLocaleString();
      return bal;
    }
    
    // Bind change events
    [sold, pending, cleared].forEach(e => e.addEventListener('input', calcRevenue));
    [pipeFee, shareFee, otherFee, saveFee].forEach(e => e.addEventListener('input', calcExpense));
    [...[...[sold, pending, cleared], pipeFee, shareFee, otherFee, saveFee]].forEach(e => e.addEventListener('input', calcBalance));

    // Submit form
    form.addEventListener('submit', e => {
      e.preventDefault();
      
      const d = dateInput.value;
      if (!d) { 
        showMessage('❌ โปรดเลือกวันที่', 'error');
        return; 
      }
      
      const payload = {
        date: d,
        sold: sold.value, 
        pending: pending.value, 
        cleared: cleared.value,
        revenue: calcRevenue(),
        pipeFee: pipeFee.value, 
        shareFee: shareFee.value, 
        otherFee: otherFee.value, 
        saveFee: saveFee.value,
        expense: calcExpense(), 
        balance: calcBalance()
      };
      
      showMessage('⏳ กำลังบันทึกข้อมูล...', 'loading');
      
      fetch(hookUrl, {
        method: 'POST', 
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(() => {
        showMessage('✅ บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
        form.reset();
        dateInput.value = new Date().toISOString().substr(0,10);
        calcRevenue(); 
        calcExpense(); 
        calcBalance();
      })
      .catch(() => {
        showMessage('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      });
    });

    // Functions to show/hide messages
    function showMessage(message, type) {
      msg.textContent = message;
      msg.className = 'msg-box ' + type;
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 3000);
    }
    
    // --- Material Calculator Functions ---
    
    const leafInput = document.getElementById('leafInput');
    const waterInput = document.getElementById('waterInput');
    const yieldInput = document.getElementById('yieldInput');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultContainer = document.getElementById('resultContainer');
    
    const resultGroundLeaf = document.getElementById('resultGroundLeaf');
    const resultGroundWater = document.getElementById('resultGroundWater');
    const resultGroundYield = document.getElementById('resultGroundYield');
    
    const resultNotGroundLeaf1 = document.getElementById('resultNotGroundLeaf1');
    const resultNotGroundWater1 = document.getElementById('resultNotGroundWater1');
    const resultNotGroundYield1 = document.getElementById('resultNotGroundYield1');
    
    const resultNotGroundLeaf2 = document.getElementById('resultNotGroundLeaf2');
    const resultNotGroundWater2 = document.getElementById('resultNotGroundWater2');
    const resultNotGroundYield2 = document.getElementById('resultNotGroundYield2');

    calculateButton.addEventListener('click', function() {
      const leaf = parseFloat(leafInput.value) || 0;
      const water = parseFloat(waterInput.value) || 0;
      const yieldDesired = parseFloat(yieldInput.value) || 0;
      
      if (leaf < 0 || water < 0 || yieldDesired < 0) {
        showMessage('⚠️ กรุณากรอกค่าที่เป็นบวกเท่านั้น!', 'error');
        return;
      }
      
      if (leaf === 0 && water === 0 && yieldDesired === 0) {
        showMessage('⚠️ กรุณากรอกค่าข้อมูลอย่างน้อยหนึ่งช่อง!', 'error');
        return;
      }
      
      let groundLeaf = 0, groundWater = 0, groundYield = 0;
      let notGroundLeaf1 = 0, notGroundWater1 = 0, notGroundYield1 = 0;
      let notGroundLeaf2 = 0, notGroundWater2 = 0, notGroundYield2 = 0;
      
      const groundRatioLeafToWater = 20;
      const groundRatioWaterToYield = 15 / 20;
      
      const notGroundRatioLeafToWater1 = 15.38;
      const notGroundRatioWaterToYield1 = 12 / 15.38;
      
      const notGroundRatioLeafToWater2 = 15.87302;
      const notGroundRatioWaterToYield2 = 12 / 15.87302;
      
      if (leaf > 0) {
        groundLeaf = leaf;
        groundWater = leaf * groundRatioLeafToWater;
        groundYield = groundWater * groundRatioWaterToYield;
        
        notGroundLeaf1 = leaf;
        notGroundWater1 = leaf * notGroundRatioLeafToWater1;
        notGroundYield1 = notGroundWater1 * notGroundRatioWaterToYield1;
        
        notGroundLeaf2 = leaf;
        notGroundWater2 = leaf * notGroundRatioLeafToWater2;
        notGroundYield2 = notGroundWater2 * notGroundRatioWaterToYield2;
        
      } else if (water > 0) {
        groundWater = water;
        groundLeaf = water / groundRatioLeafToWater;
        groundYield = water * groundRatioWaterToYield;
        
        notGroundWater1 = water;
        notGroundLeaf1 = water / notGroundRatioLeafToWater1;
        notGroundYield1 = water * notGroundRatioWaterToYield1;
        
        notGroundWater2 = water;
        notGroundLeaf2 = water / notGroundRatioLeafToWater2;
        notGroundYield2 = water * notGroundRatioWaterToYield2;
        
      } else if (yieldDesired > 0) {
        groundYield = yieldDesired;
        groundWater = yieldDesired / groundRatioWaterToYield;
        groundLeaf = groundWater / groundRatioLeafToWater;
        
        notGroundYield1 = yieldDesired;
        notGroundWater1 = yieldDesired / notGroundRatioWaterToYield1;
        notGroundLeaf1 = notGroundWater1 / notGroundRatioLeafToWater1;
        
        notGroundYield2 = yieldDesired;
        notGroundWater2 = yieldDesired / notGroundRatioWaterToYield2;
        notGroundLeaf2 = notGroundWater2 / notGroundRatioLeafToWater2;
      }
      
      resultGroundLeaf.textContent = groundLeaf.toFixed(2);
      resultGroundWater.textContent = groundWater.toFixed(2);
      resultGroundYield.textContent = groundYield.toFixed(2);
      
      resultNotGroundLeaf1.textContent = notGroundLeaf1.toFixed(2);
      resultNotGroundWater1.textContent = notGroundWater1.toFixed(2);
      resultNotGroundYield1.textContent = notGroundYield1.toFixed(2);
      
      resultNotGroundLeaf2.textContent = notGroundLeaf2.toFixed(2);
      resultNotGroundWater2.textContent = notGroundWater2.toFixed(2);
      resultNotGroundYield2.textContent = notGroundYield2.toFixed(2);
      
      resultContainer.style.display = 'block';
      showMessage('✅ คำนวณข้อมูลเรียบร้อยแล้ว', 'success');
    });
    
    resetButton.addEventListener('click', function() {
      leafInput.value = '';
      waterInput.value = '';
      yieldInput.value = '';
      resultContainer.style.display = 'none';
      showMessage('♻️ รีเซ็ตฟอร์มเรียบร้อยแล้ว', 'success');
    });

    // --- Dashboard Functions ---
    
    const salesChartCanvas = document.getElementById('salesChart');
    const profitChartCanvas = document.getElementById('profitChart');
    const exportBtn = document.getElementById('export-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const dateRangeFilter = document.getElementById('date-range');
    const periodGroupFilter = document.getElementById('period-group');
    const metricFilter = document.getElementById('metric');
    const compareFilter = document.getElementById('compare');
    const kpiContainer = document.getElementById('kpi-container');
    const historyTableBody = document.getElementById('history-table-body');

    let salesChartInstance = null;
    let profitChartInstance = null;

    // ฟังก์ชันจำลองการทำงานของ Google Apps Script API
    ,
        withFailureHandler: function(callback) {
          this.failureCallback = callback;
          return this;
        },
        getDashboardData: function(period, dateRange, metric, compare) {
          // จำลองการโหลดข้อมูล
          setTimeout(() => {
            try {
              // สร้างข้อมูลตัวอย่างสำหรับแดชบอร์ด
              const mockData = {
                kpi: {
                  sold: 150,
                  revenue: 6000,
                  profit: 3500,
                  balance: 4500
                },
                chartData: {
                  salesChart: {
                    periods: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
                    currentData: [20, 25, 30, 35, 40, 45],
                    valueLabel: 'จำนวนที่ขายได้',
                    periodLabel: 'เดือน'
                  },
                  profitChart: {
                    periods: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
                    revenueData: [4000, 4500, 5000, 5500, 6000, 6500],
                    profitData: [2500, 2800, 3000, 3200, 3500, 3800],
                    periodLabel: 'เดือน'
                  }
                },
                historyData: [
                  { date: '2023-06-01', sold: 45, revenue: 1800, fees: 600, expense: 700, balance: 500 },
                  { date: '2023-05-28', sold: 40, revenue: 1600, fees: 600, expense: 600, balance: 400 },
                  { date: '2023-05-25', sold: 35, revenue: 1400, fees: 600, expense: 500, balance: 300 }
                ]
              };
              
              this.successCallback(mockData);
            } catch (error) {
              this.failureCallback(error);
            }
          }, 1000);
        },
        exportToCSV: function() {
          // จำลองการส่งออก CSV
          setTimeout(() => {
            this.successCallback(sheetUrl);
          }, 500);
        },
        saveData: function(formData) {
          // จำลองการบันทึกข้อมูล
          setTimeout(() => {
            this.successCallback({ success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
          }, 500);
        }
      };
    }

    // กำหนดค่าเริ่มต้นสำหรับ // (removed google.script.run call)
    }

    function fetchDataAndRender() {
      const period = periodGroupFilter.value;
      const dateRange = dateRangeFilter.value;
      const metric = metricFilter.value;
      const compare = compareFilter.value;
      showMessage('⏳ กำลังโหลดข้อมูล...', 'loading');
      const url = `${window.APP_CONFIG.DASHBOARD_URL}?action=getDashboardData&period=${encodeURIComponent(period)}&dateRange=${encodeURIComponent(dateRange)}&metric=${encodeURIComponent(metric)}&compare=${encodeURIComponent(compare)}`;
      fetch(url, { method: 'GET' })
        .then(r => {
          if (!r.ok) throw new Error('Network error ' + r.status);
          return r.json();
        })
        .then(data => {
          renderDashboard(data);
          showMessage('✅ โหลดข้อมูลสำเร็จ', 'success');
        })
        .catch(err => {
          console.error(err);
          showMessage('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message, 'error');
        });
    })
        .withFailureHandler(function(error) {
          showMessage('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message, 'error');
        })
        .getDashboardData(period, dateRange, metric, compare);
    }
    
    function renderDashboard(data) {
      if (!data || !data.kpi || !data.chartData || !data.historyData) {
        kpiContainer.innerHTML = `<p class="text-center text-gray-500 mt-8 col-span-4">ไม่พบข้อมูลสำหรับช่วงเวลาที่เลือก</p>`;
        
        // ลบกราฟถ้ามี
        if (salesChartInstance) salesChartInstance.destroy();
        if (profitChartInstance) profitChartInstance.destroy();
        
        // แสดงข้อความว่าไม่มีข้อมูลในกราฟ
        document.querySelector('.chart-wrapper:first-child').innerHTML = '<p class="text-center text-gray-500 py-12">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>';
        document.querySelector('.chart-wrapper:last-child').innerHTML = '<p class="text-center text-gray-500 py-12">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>';
        
        // แสดงข้อความว่าไม่มีข้อมูลในตาราง
        historyTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">ไม่พบข้อมูล</td></tr>`;
        return;
      }
      
      // แสดงข้อมูลตามปกติ
      renderKPIs(data.kpi);
      renderSalesChart(data.chartData.salesChart);
      renderProfitChart(data.chartData.profitChart);
      renderHistoryTable(data.historyData);
    }

    function renderKPIs(kpiData) {
      const kpis = [
        { label: 'ยอดขายทั้งหมด', value: kpiData.sold, format: 'number' },
        { label: 'รายได้ทั้งหมด', value: kpiData.revenue, format: 'currency' },
        { label: 'กำไรทั้งหมด', value: kpiData.profit, format: 'currency' },
        { label: 'ยอดคงเหลือล่าสุด', value: kpiData.balance, format: 'currency' }
      ];

      kpiContainer.innerHTML = kpis.map(kpi => `
        <div class="kpi-card">
          <div class="label">${kpi.label}</div>
          <div class="value">
            ${kpi.format === 'currency' ? '฿' + kpi.value.toLocaleString() : kpi.value.toLocaleString()}
          </div>
        </div>
      `).join('');
    }

    function renderSalesChart(salesChartData) {
      if (salesChartInstance) salesChartInstance.destroy();

      const datasets = [{
        label: `ข้อมูลปัจจุบัน`,
        data: salesChartData.currentData,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.3,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        datalabels: { display: false }
      }];

      if (salesChartData.compareData) {
        datasets.push({
          label: salesChartData.compareLabel,
          data: salesChartData.compareData,
          borderColor: '#9E9E9E',
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderDash: [5, 5],
          datalabels: { display: false }
        });
      }

      // ตรวจสอบว่าเป็นมือถือหรือไม่เพื่อปรับการแสดงผล
      const isMobile = window.innerWidth < 768;
      
      salesChartInstance = new Chart(salesChartCanvas, {
        type: 'line',
        data: {
          labels: salesChartData.periods,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: !isMobile, // ซ้าย title บนมือถือ
                text: salesChartData.valueLabel,
                font: { family: 'Kanit', weight: 'bold', size: isMobile ? 10 : 12 }
              },
              ticks: {
                callback: function(value) {
                  return salesChartData.valueLabel.includes('฿') ? '฿' + value.toLocaleString() : value.toLocaleString();
                },
                font: { family: 'Kanit', size: isMobile ? 10 : 12 }
              }
            },
            x: {
              title: {
                display: !isMobile, // ซ้าย title บนมือถือ
                text: salesChartData.periodLabel,
                font: { family: 'Kanit', weight: 'bold', size: isMobile ? 10 : 12 }
              },
              ticks: {
                font: { family: 'Kanit', size: isMobile ? 10 : 12 }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: 'Kanit', size: isMobile ? 10 : 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) label += salesChartData.valueLabel.includes('฿') ? '฿' + context.parsed.y.toLocaleString() : context.parsed.y.toLocaleString();
                  return label;
                }
              },
              titleFont: { family: 'Kanit', size: isMobile ? 10 : 12 },
              bodyFont: { family: 'Kanit', size: isMobile ? 10 : 12 }
            }
          }
        }
      });
    }

    function renderProfitChart(profitChartData) {
      if (profitChartInstance) profitChartInstance.destroy();

      // ตรวจสอบว่าเป็นมือถือหรือไม่เพื่อปรับการแสดงผล
      const isMobile = window.innerWidth < 768;
      
      profitChartInstance = new Chart(profitChartCanvas, {
        type: 'bar',
        data: {
          labels: profitChartData.periods,
          datasets: [{
              label: 'รายได้',
              data: profitChartData.revenueData,
              backgroundColor: '#4CAF50',
              borderRadius: 5,
              datalabels: { display: false }
            },
            {
              label: 'กำไร',
              data: profitChartData.profitData,
              backgroundColor: '#8BC34A',
              borderRadius: 5,
              datalabels: { display: false }
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: false,
              title: {
                display: !isMobile, // ซ้าย title บนมือถือ
                text: profitChartData.periodLabel,
                font: { family: 'Kanit', weight: 'bold', size: isMobile ? 10 : 12 }
              },
              ticks: {
                font: { family: 'Kanit', size: isMobile ? 10 : 12 }
              }
            },
            y: {
              stacked: false,
              title: {
                display: !isMobile, // ซ้าย title บนมือถือ
                text: 'จำนวนเงิน (฿)',
                font: { family: 'Kanit', weight: 'bold', size: isMobile ? 10 : 12 }
              },
              ticks: {
                callback: (value) => '฿' + value.toLocaleString(),
                font: { family: 'Kanit', size: isMobile ? 10 : 12 }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { 
                font: { family: 'Kanit', size: isMobile ? 10 : 12 } 
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) label += '฿' + context.parsed.y.toLocaleString();
                  return label;
                }
              },
              titleFont: { family: 'Kanit', size: isMobile ? 10 : 12 },
              bodyFont: { family: 'Kanit', size: isMobile ? 10 : 12 }
            }
          }
        }
      });
    }

    function renderHistoryTable(historyData) {
      historyTableBody.innerHTML = historyData.map(row => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${row.date}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.sold}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">฿${row.revenue.toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">฿${row.fees.toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">฿${(row.revenue - row.fees - row.expense).toLocaleString()}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">฿${row.balance.toLocaleString()}</td>
        </tr>
      `).join('');
    }

    function handleError(error) {
      console.error(error);
      showMessage('❌ เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message, 'error');
    }

    // --- Initial setup & Event Listeners ---
    
    document.addEventListener('DOMContentLoaded', function() {
      const currentDateElement = document.getElementById('currentDate');
      const today = new Date();
      currentDateElement.textContent = today.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      
      const tabBtns = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');
      
      function activateTab(tabId) {
        tabContents.forEach(content => content.classList.remove('active'));
        tabBtns.forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(tabId).classList.add('active');
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        
        if (tabId === 'dashboard-tab') {
          fetchDataAndRender();
        }
      }
      
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          activateTab(btn.getAttribute('data-tab'));
        });
      });
      
      // Load sales dashboard on initial page load
      fetchDataAndRender();

      // Sales form listeners
      calcRevenue(); 
      calcExpense(); 
      calcBalance();
      sheetBtn.addEventListener('click', () => window.open(sheetUrl, '_blank'));
      reportBtn.addEventListener('click', () => activateTab('dashboard-tab'));

      // Dashboard listeners
      [dateRangeFilter, periodGroupFilter, metricFilter, compareFilter].forEach(el => {
        el.addEventListener('change', fetchDataAndRender);
      });
      refreshBtn.addEventListener('click', fetchDataAndRender);
      exportBtn.addEventListener('click', () => {
  const url = `${window.APP_CONFIG.DASHBOARD_URL}?action=exportToCSV`;
  window.open(url, '_blank');
});

      // เพิ่ม event listener สำหรับการเปลี่ยนขนาดหน้าจอ
      window.addEventListener('resize', function() {
        if (document.getElementById('dashboard-tab').classList.contains('active')) {
          // รีเซ็ตกราฟเมื่อเปลี่ยนขนาดหน้าจอ
          if (salesChartInstance) {
            salesChartInstance.destroy();
            salesChartInstance = null;
          }
          if (profitChartInstance) {
            profitChartInstance.destroy();
            profitChartInstance = null;
          }
          fetchDataAndRender();
        }
      });
    });

    // ฟังก์ชันบันทึกข้อมูลผ่าน Google Apps Script
    function saveFormData(formData) {
      showMessage('⏳ กำลังบันทึกข้อมูล...', 'loading');
      fetch(hookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(r => {
        if (!r.ok) throw new Error('Network error ' + r.status);
        return r.json();
      })
      .then(response => {
        if (response && (response.success || response.status === 'ok')) {
          showMessage('✅ บันทึกสำเร็จ', 'success');
          document.getElementById('saleForm').reset();
          document.getElementById('date').value = new Date().toISOString().substr(0,10);
          calcRevenue();
          calcExpense();
          calcBalance();
        } else {
          showMessage('❌ ' + (response && (response.error || response.message) || 'บันทึกล้มเหลว'), 'error');
        }
      })
      .catch(err => {
        console.error(err);
        showMessage('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + err.message, 'error');
      });
    } else {
            showMessage('❌ ' + response.error, 'error');
          }
        })
        .withFailureHandler(function(error) {
          showMessage('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message, 'error');
        })
        .saveData(formData);
    }

  