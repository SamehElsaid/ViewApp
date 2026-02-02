import ApexChart from 'src/Components/ApexChart'

const MyDashboard = () => {
  return (
    <div>
        <ApexChart apiEndpoint="https://localhost:7101/api/dynamic-report-data/chartapi3" chartType="pie" />
        <ApexChart apiEndpoint="https://localhost:7101/api/dynamic-report-data/chartapi3" chartType="donut" />
        <ApexChart apiEndpoint="https://localhost:7101/api/dynamic-report-data/chartapi3" chartType="bar" />
        <ApexChart apiEndpoint="https://localhost:7101/api/dynamic-report-data/chartapi3" chartType="line" />

        <ApexChart apiEndpoint="https://localhost:7101/api/dynamic-report-data/chartapi3" chartType="radialBar" />
    </div>
  )
}

export default MyDashboard
