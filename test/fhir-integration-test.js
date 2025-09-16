// Test script to verify FHIR API integration
import { patientsApi } from '../lib/api/patients'
import { appointmentsApi } from '../lib/api/appointments'

async function testFHIRIntegration() {
  console.log('🏥 Testing FHIR API Integration...\n')
  
  try {
    // Test 1: Search for patients
    console.log('1. Testing patient search...')
    const searchResults = await patientsApi.search('Smith', 'name')
    console.log(`   ✅ Found ${searchResults.data.length} patients`)
    if (searchResults.data.length > 0) {
      console.log(`   📋 First patient: ${searchResults.data[0].firstName} ${searchResults.data[0].lastName}`)
    }
  } catch (error) {
    console.log(`   ❌ Patient search failed: ${error.message}`)
  }

  try {
    // Test 2: Get all patients with pagination
    console.log('\n2. Testing get all patients...')
    const allPatients = await patientsApi.getAll(1, 10)
    console.log(`   ✅ Retrieved ${allPatients.data.length} patients (page 1)`)
    console.log(`   📊 Total patients in system: ${allPatients.total}`)
  } catch (error) {
    console.log(`   ❌ Get all patients failed: ${error.message}`)
  }

  try {
    // Test 3: Get appointments by date range
    console.log('\n3. Testing appointments by date range...')
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const appointments = await appointmentsApi.getByDateRange(today, nextWeek)
    console.log(`   ✅ Found ${appointments.data.length} appointments`)
    if (appointments.data.length > 0) {
      console.log(`   📅 First appointment: ${appointments.data[0].patientName} on ${appointments.data[0].date}`)
    }
  } catch (error) {
    console.log(`   ❌ Get appointments failed: ${error.message}`)
  }

  try {
    // Test 4: Get providers
    console.log('\n4. Testing get providers...')
    const providers = await appointmentsApi.getProviders()
    console.log(`   ✅ Found ${providers.data.length} providers`)
    if (providers.data.length > 0) {
      console.log(`   👨‍⚕️ First provider: ${providers.data[0].name} (${providers.data[0].specialty})`)
    }
  } catch (error) {
    console.log(`   ❌ Get providers failed: ${error.message}`)
  }

  console.log('\n🎉 FHIR API Integration test completed!')
}

// Run the test
testFHIRIntegration()