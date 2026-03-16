<template>
    <div class="data-manage-container">
      <div class="dashboard-header">
        <h1>农产品数据分析平台</h1>
        <div class="time-selector">
          <el-radio-group v-model="timeRange" size="small">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="year">全年</el-radio-button>
          </el-radio-group>
        </div>
      </div>
  
      <el-row :gutter="20" class="dashboard-row">
        <el-col :xs="24" :sm="12" :md="6" v-for="(card, index) in dataCards" :key="index">
          <div class="data-card" :class="card.type">
            <div class="card-icon">
              <el-icon>
                <component :is="card.icon"></component>
              </el-icon>
            </div>
            <div class="card-content">
              <div class="card-title">{{ card.title }}</div>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-change" :class="card.trend">
                <el-icon>
                  <component :is="card.trend === 'up' ? 'ArrowUp' : 'ArrowDown'"></component>
                </el-icon>
                {{ card.change }}% 较上期
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
  
      <el-row :gutter="20" class="dashboard-row">
        <el-col :xs="24" :md="16">
          <div class="chart-container">
            <div class="chart-header">
              <h3>农产品销售趋势</h3>
              <div class="chart-controls">
                <el-select v-model="selectedProduct" placeholder="选择产品" size="small" style="width: 120px; margin-right: 10px;">
                  <el-option v-for="item in productOptions" :key="item.value" :label="item.label" :value="item.value">
                  </el-option>
                </el-select>
                <el-radio-group v-model="salesChartType" size="small">
                  <el-radio-button label="bar">柱状图</el-radio-button>
                  <el-radio-button label="line">折线图</el-radio-button>
                  <el-radio-button label="mixed">混合图</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div ref="salesTrendChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :xs="24" :md="8">
          <div class="chart-container">
            <div class="chart-header">
              <h3>产品类别分布</h3>
              <el-radio-group v-model="pieChartType" size="small">
                <el-radio-button label="pie">饼图</el-radio-button>
                <el-radio-button label="ring">环形图</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="categoryPieChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
  
      <el-row :gutter="20" class="dashboard-row">
        <el-col :xs="24" :md="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>各地区销售情况</h3>
              <el-radio-group v-model="regionChartType" size="small">
                <el-radio-button label="bar">柱状图</el-radio-button>
                <el-radio-button label="pie">饼图</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="regionBarChart" class="chart"></div>
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="chart-container">
            <div class="chart-header">
              <h3>农产品价格波动</h3>
              <el-radio-group v-model="priceChartType" size="small">
                <el-radio-button label="line">折线图</el-radio-button>
                <el-radio-button label="bar">柱状图</el-radio-button>
                <el-radio-button label="area">面积图</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="priceFluctuationChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
  
      <el-row :gutter="20" class="dashboard-row">
        <el-col :span="24">
          <div class="chart-container">
            <div class="chart-header">
              <h3>热门农产品排行</h3>
              <el-radio-group v-model="rankingChartType" size="small">
                <el-radio-button label="horizontal">横向柱状图</el-radio-button>
                <el-radio-button label="vertical">纵向柱状图</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="rankingChart" class="chart"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
  import * as echarts from 'echarts';
  import { 
    Money, ShoppingCart, Apple, User, 
    ArrowUp, ArrowDown 
  } from '@element-plus/icons-vue';
import console from 'node:console';

  // 响应式数据
  const timeRange = ref('month');
  const selectedProduct = ref('apple');
  const priceChartType = ref('line');
  const salesChartType = ref('mixed');
  const pieChartType = ref('ring');
  const regionChartType = ref('bar');
  const rankingChartType = ref('horizontal');
  
  // 图表实例引用
  const salesTrendChart = ref(null);
  const categoryPieChart = ref(null);
  const regionBarChart = ref(null);
  const priceFluctuationChart = ref(null);
  const rankingChart = ref(null);
  
  // 图表实例对象
  let salesTrendChartInstance = null;
  let categoryPieChartInstance = null;
  let regionBarChartInstance = null;
  let priceFluctuationChartInstance = null;
  let rankingChartInstance = null;
  
  // 数据卡片
  const dataCards = ref([
    {
      title: '总销售额',
      value: '¥ 2,456,789',
      change: '12.5',
      trend: 'up',
      type: 'sales',
      icon: 'Money'
    },
    {
      title: '订单总量',
      value: '8,546',
      change: '8.2',
      trend: 'up',
      type: 'orders',
      icon: 'ShoppingCart'
    },
    {
      title: '农产品种类',
      value: '124',
      change: '3.1',
      trend: 'up',
      type: 'products',
      icon: 'Apple'
    },
    {
      title: '合作农户',
      value: '1,893',
      change: '1.2',
      trend: 'down',
      type: 'farmers',
      icon: 'User'
    }
  ]);
  
  // 产品选项
  const productOptions = ref([
    { value: 'apple', label: '苹果' },
    { value: 'orange', label: '橙子' },
    { value: 'banana', label: '香蕉' },
    { value: 'grape', label: '葡萄' },
    { value: 'watermelon', label: '西瓜' },
    { value: 'strawberry', label: '草莓' },
    { value: 'kiwi', label: '猕猴桃' }
  ]);
  
  // 销售趋势图表数据
  const getSalesTrendData = () => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // 根据选择的产品返回不同的数据
    const productData = {
      apple: [150, 230, 224, 218, 135, 147, 260, 265, 290, 310, 350, 380],
      orange: [120, 200, 190, 170, 160, 120, 130, 140, 200, 230, 240, 250],
      banana: [90, 110, 130, 150, 160, 180, 190, 200, 210, 220, 230, 240],
      grape: [50, 60, 70, 90, 120, 160, 180, 190, 200, 210, 220, 230],
      watermelon: [30, 40, 50, 60, 120, 150, 180, 210, 170, 130, 90, 60],
      strawberry: [80, 120, 160, 200, 180, 150, 100, 80, 70, 90, 110, 130],
      kiwi: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170]
    };
  
    // 同比增长数据
    const growthData = {
      apple: [10, 15, 12, 8, -5, 3, 18, 2, 9, 7, 13, 8],
      orange: [8, 12, -5, -10, -6, -25, 8, 7, 43, 15, 4, 4],
      banana: [5, 22, 18, 15, 7, 12, 5, 5, 5, 5, 5, 4],
      grape: [12, 20, 17, 29, 33, 33, 12, 5, 5, 5, 5, 5],
      watermelon: [20, 33, 25, 20, 100, 25, 20, 17, -19, -24, -31, -33],
      strawberry: [15, 50, 33, 25, -10, -17, -33, -20, -12, 29, 22, 18],
      kiwi: [10, 17, 14, 12, 11, 10, 9, 8, 7, 7, 7, 6]
    };
  
    return {
      xAxis: months,
      data: productData[selectedProduct.value] || productData.apple,
      growth: growthData[selectedProduct.value] || growthData.apple
    };
  };
  
  // 产品类别分布数据
  const getCategoryData = () => {
    return [
      { value: 35, name: '水果类' },
      { value: 20, name: '蔬菜类' },
      { value: 15, name: '谷物类' },
      { value: 10, name: '坚果类' },
      { value: 8, name: '食用菌类' },
      { value: 7, name: '药材类' },
      { value: 5, name: '其他' }
    ];
  };
  
  // 地区销售数据
  const getRegionData = () => {
    return [
      { name: '华东地区', value: 4200 },
      { name: '华南地区', value: 3500 },
      { name: '华北地区', value: 2800 },
      { name: '华中地区', value: 2500 },
      { name: '西南地区', value: 1800 },
      { name: '西北地区', value: 1200 },
      { name: '东北地区', value: 1500 }
    ];
  };
  
  // 价格波动数据
  const getPriceFluctuationData = () => {
    return {
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      series: [
        {
          name: '苹果',
          data: [5.2, 5.5, 5.8, 6.0, 5.9, 5.8, 6.2, 6.5, 6.3, 6.1, 5.9, 6.0]
        },
        {
          name: '橙子',
          data: [4.5, 4.8, 5.0, 5.2, 5.3, 5.5, 5.6, 5.4, 5.2, 5.0, 4.8, 4.6]
        },
        {
          name: '香蕉',
          data: [3.8, 4.0, 4.2, 4.3, 4.5, 4.6, 4.5, 4.3, 4.2, 4.0, 3.9, 3.8]
        },
        {
          name: '葡萄',
          data: [8.5, 8.8, 9.0, 9.2, 9.0, 8.8, 8.5, 8.2, 8.0, 8.3, 8.5, 8.7]
        },
        {
          name: '西瓜',
          data: [2.0, 2.2, 2.5, 2.8, 3.0, 2.8, 2.5, 2.3, 2.0, 1.8, 1.9, 2.0]
        }
      ]
    };
  };
  
  // 热门农产品排行数据
  const getRankingData = () => {
    return {
      products: ['苹果', '橙子', '香蕉', '葡萄', '西瓜', '草莓', '猕猴桃', '柚子', '梨', '桃'],
      sales: [320, 302, 290, 274, 250, 236, 220, 200, 180, 160],
      profits: [120, 102, 90, 80, 70, 60, 50, 40, 30, 20],
      growth: [12.5, 10.2, 8.7, 15.3, 5.6, 20.1, 7.8, 4.5, 3.2, 6.7]
    };
  };
  
  // 初始化销售趋势图表
  const initSalesTrendChart = () => {
    if (!salesTrendChart.value) return;
    salesTrendChartInstance = echarts.init(salesTrendChart.value);
    updateSalesTrendChart();
  };
  
  // 更新销售趋势图表
  const updateSalesTrendChart = () => {
    if (!salesTrendChartInstance) return;
    const { xAxis, data, growth } = getSalesTrendData();
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['销售量', '同比增长'],
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '销售量 (吨)',
          nameTextStyle: {
            color: '#666'
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        {
          type: 'value',
          name: '同比增长 (%)',
          nameTextStyle: {
            color: '#666'
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#666',
            formatter: '{value}%'
          },
          splitLine: {
            show: false
          }
        }
      ],
      series: getSalesTrendSeries(data, growth)
    };
    salesTrendChartInstance.setOption(option);
  };
  
  // 根据图表类型获取销售趋势系列
  const getSalesTrendSeries = (data, growth) => {
    const series = [];
    if (salesChartType.value === 'bar' || salesChartType.value === 'mixed') {
      series.push({
        name: '销售量',
        type: 'bar',
        data: data,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      });
    }
    
    if (salesChartType.value === 'line' || salesChartType.value === 'mixed') {
      series.push({
        name: '销售量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: data,
        lineStyle: {
          width: 3,
          color: salesChartType.value === 'line' ? '#5470c6' : '#FF8C00'
        },
        itemStyle: {
          color: salesChartType.value === 'line' ? '#5470c6' : '#FF8C00'
        }
      });
    }
    
    series.push({
      name: '同比增长',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      showSymbol: true,
      symbolSize: 6,
      data: growth,
      lineStyle: {
        width: 2,
        color: '#91cc75'
      },
      itemStyle: {
        color: '#91cc75'
      }
    });
    
    return series;
  };
  
  // 初始化产品类别分布图表
  const initCategoryPieChart = () => {
    if (!categoryPieChart.value) return;
    
    categoryPieChartInstance = echarts.init(categoryPieChart.value);
    
    updateCategoryPieChart();
  };
  
  // 更新产品类别分布图表
  const updateCategoryPieChart = () => {
    if (!categoryPieChartInstance) return;
    
    const data = getCategoryData();
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map(item => item.name),
        textStyle: {
          color: '#666'
        }
      },
      series: [
        {
          name: '产品类别',
          type: 'pie',
          radius: pieChartType.value === 'ring' ? ['50%', '70%'] : '70%',
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: pieChartType.value !== 'ring',
            position: 'outside',
            formatter: '{b}: {d}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: pieChartType.value !== 'ring'
          },
          data: data
        }
      ],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
    };
    
    categoryPieChartInstance.setOption(option);
  };
  
  // 初始化地区销售图表
  const initRegionBarChart = () => {
    if (!regionBarChart.value) return;
    
    regionBarChartInstance = echarts.init(regionBarChart.value);
    
    updateRegionBarChart();
  };
  
  // 更新地区销售图表
  const updateRegionBarChart = () => {
    if (!regionBarChartInstance) return;
    
    const data = getRegionData();
    
    if (regionChartType.value === 'bar') {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: data.map(item => item.name),
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: data.map(item => item.value),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{c} 万元'
            }
          }
        ]
      };
      
      regionBarChartInstance.setOption(option);
    } else {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.map(item => item.name),
          textStyle: {
            color: '#666'
          }
        },
        series: [
          {
            name: '地区销售',
            type: 'pie',
            radius: '70%',
            center: ['40%', '50%'],
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c} 万元 ({d}%)'
            }
          }
        ],
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
      };
      
      regionBarChartInstance.setOption(option);
    }
  };
  
  // 初始化价格波动图表
  const initPriceFluctuationChart = () => {
    if (!priceFluctuationChart.value) return;
    
    priceFluctuationChartInstance = echarts.init(priceFluctuationChart.value);
    
    updatePriceFluctuationChart();
  };
  
  // 更新价格波动图表
  const updatePriceFluctuationChart = () => {
    if (!priceFluctuationChartInstance) return;
    
    const { xAxis, series } = getPriceFluctuationData();
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: series.map(item => item.name),
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: priceChartType.value === 'bar',
        data: xAxis,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        name: '价格 (元/kg)',
        nameTextStyle: {
          color: '#666'
        },
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#eee'
          }
        }
      },
      series: series.map(item => ({
        name: item.name,
        type: priceChartType.value === 'area' ? 'line' : priceChartType.value,
        data: item.data,
        smooth: true,
        areaStyle: priceChartType.value === 'area' ? {
          opacity: 0.3
        } : undefined
      }))
    };
    
    priceFluctuationChartInstance.setOption(option);
  };
  
  // 初始化热门农产品排行图表
  const initRankingChart = () => {
    if (!rankingChart.value) return;
    
    rankingChartInstance = echarts.init(rankingChart.value);
    
    updateRankingChart();
  };
  
  // 更新热门农产品排行图表
  const updateRankingChart = () => {
    if (!rankingChartInstance) return;
    
    const { products, sales, profits, growth } = getRankingData();
    
    if (rankingChartType.value === 'horizontal') {
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['销售量', '利润', '增长率'],
          textStyle: {
            color: '#666'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: products,
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        series: [
          {
            name: '销售量',
            type: 'bar',
            data: sales,
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '利润',
            type: 'bar',
            data: profits,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '增长率',
            type: 'line',
            yAxisIndex: 0,
            data: growth.map((value, index) => ({
              value: value,
              yAxis: index,
              xAxis: Math.max(sales[index], profits[index]) + 20
            })),
            symbolSize: 8,
            itemStyle: {
              color: '#fac858'
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{c}%'
            }
          }
        ]
      };
      
      rankingChartInstance.setOption(option);
    } else {
        const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['销售量', '利润', '增长率'],
        textStyle: {
          color: '#666'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: products,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          color: '#666',
          rotate: 45
        }
      },
      yAxis: [
        {
          type: 'value',
          name: '销量/利润',
          nameTextStyle: {
            color: '#666'
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#666'
          },
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        },
        {
          type: 'value',
          name: '增长率 (%)',
          nameTextStyle: {
            color: '#666'
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            color: '#666',
            formatter: '{value}%'
          },
          splitLine: {
            show: false
          }
        }
      ],
        series: [
          {
            name: '销售量',
            type: 'bar',
            data: sales,
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '利润',
            type: 'bar',
            data: profits,
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '增长率',
            type: 'line',
            yAxisIndex: 1,
            data: growth,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2,
              color: '#fac858'
            },
            itemStyle: {
              color: '#fac858'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              color: '#666'
            }
          }
        ]
      };
      
      rankingChartInstance.setOption(option);
    }
  };

  // 监听窗口大小变化，重新调整图表大小
  const handleResize = () => {
    salesTrendChartInstance && salesTrendChartInstance.resize();
    categoryPieChartInstance && categoryPieChartInstance.resize();
    regionBarChartInstance && regionBarChartInstance.resize();
    priceFluctuationChartInstance && priceFluctuationChartInstance.resize();
    rankingChartInstance && rankingChartInstance.resize();
  };

  // 监听选择的产品变化
  watch(selectedProduct, () => {
    updateSalesTrendChart();
  });

  // 监听销售图表类型变化
  watch(salesChartType, () => {
    updateSalesTrendChart();
  });

  // 监听饼图类型变化
  watch(pieChartType, () => {
    updateCategoryPieChart();
  });

  // 监听地区图表类型变化
  watch(regionChartType, () => {
    updateRegionBarChart();
  });

  // 监听价格图表类型变化
  watch(priceChartType, () => {
    updatePriceFluctuationChart();
  });

  // 监听排行图表类型变化
  watch(rankingChartType, () => {
    updateRankingChart();
  });

  // 监听时间范围变化
  watch(timeRange, () => {
    // 这里可以根据时间范围更新所有图表数据
    // 简化起见，这里不做实际数据更新
  });

  // 在组件挂载时初始化所有图表
  onMounted(() => {
    // 初始化所有图表
    initSalesTrendChart();
    initCategoryPieChart();
    initRegionBarChart();
    initPriceFluctuationChart();
    initRankingChart();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);
  });

  // 组件卸载前清理资源
  onBeforeUnmount(() => {
    // 移除窗口大小变化监听
    window.removeEventListener('resize', handleResize);
    
    // 销毁图表实例
    salesTrendChartInstance && salesTrendChartInstance.dispose();
    categoryPieChartInstance && categoryPieChartInstance.dispose();
    regionBarChartInstance && regionBarChartInstance.dispose();
    priceFluctuationChartInstance && priceFluctuationChartInstance.dispose();
    rankingChartInstance && rankingChartInstance.dispose();
  });

</script>

<style scoped lang=scss>
.data-manage-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  min-width: 1200px;
  margin-left: -50px;
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      color: #303133;
    }
    
    .time-selector {
      display: flex;
      align-items: center;
    }
  }
  
  .dashboard-row {
    margin-bottom: 20px;
  }
  
  .data-card {
    display: flex;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
    }
    
    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      margin-right: 15px;
      font-size: 24px;
      color: #fff;
    }
    
    .card-content {
      flex: 1;
      
      .card-title {
        font-size: 14px;
        color: #909399;
        margin-bottom: 5px;
      }
      
      .card-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
      }
      
      .card-change {
        font-size: 12px;
        display: flex;
        align-items: center;
        
        i {
          margin-right: 5px;
        }
        
        &.up {
          color: #67c23a;
        }
        
        &.down {
          color: #f56c6c;
        }
      }
    }
    
    &.sales {
      .card-icon {
        background-color: #409eff;
      }
    }
    
    &.orders {
      .card-icon {
        background-color: #67c23a;
      }
    }
    
    &.products {
      .card-icon {
        background-color: #e6a23c;
      }
    }
    
    &.farmers {
      .card-icon {
        background-color: #f56c6c;
      }
    }
  }
  
  .chart-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 20px;
    margin-bottom: 20px;
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
        font-weight: 500;
      }
    }
    
    .chart {
      height: 350px;
      width: 100%;
    }
  }
}

// 响应式调整
@media screen and (max-width: 768px) {
  .data-manage-container {
    padding: 10px;
    min-width: auto;
    
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      
      h1 {
        margin-bottom: 10px;
      }
    }
    
    .chart-container {
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        
        h3 {
          margin-bottom: 10px;
        }
      }
      
      .chart {
        height: 300px;
      }
    }
  }
}
</style>