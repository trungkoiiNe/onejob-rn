import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { useAuthStore, useJobStore } from '@/stores';
import { JobDetails, JobSalaryType, JobType } from '@/stores/jobStore';

const { width } = Dimensions.get('window');

export default function EmployerJobs() {
  const { user } = useAuthStore();
  const { jobs, isLoading, error, fetchJobs, addJob, addJobViaRPC, deleteJob } = useJobStore(); const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [useRPC, setUseRPC] = useState(false); // Whether to use RPC for job creation

  // Date picker states
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobSalary, setJobSalary] = useState('');
  const [jobSalaryType, setJobSalaryType] = useState<JobSalaryType>('per_hour');
  const [jobType, setJobType] = useState<JobType>('part_time');
  const [jobStartDate, setJobStartDate] = useState('');
  const [jobEndDate, setJobEndDate] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [jobBenefits, setJobBenefits] = useState('');
  const [jobSlotsAvailable, setJobSlotsAvailable] = useState('1');
  const [jobTags, setJobTags] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    if (user?.id) {
      await fetchJobs(user.id);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  // Helper function to format date for database
  const formatDateForDB = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleAddJob = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to post a job');
      return;
    } if (!jobTitle || !jobDescription || !jobLocation || !jobSalary) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate end date is after start date
    if (hasEndDate && endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    } const newJobDetails: JobDetails = {
      title: jobTitle,
      description: jobDescription,
      employerId: user.id,
      location: jobLocation,
      salary: jobSalary,
      salaryType: jobSalaryType,
      jobType: jobType,
      startDate: formatDateForDB(startDate),
      endDate: hasEndDate ? formatDateForDB(endDate) : null,
      requirements: jobRequirements,
      benefits: jobBenefits,
      slotsAvailable: parseInt(jobSlotsAvailable) || 1,
      tags: jobTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
    };

    // Use either direct DB insertion or RPC based on the toggle
    const jobId = useRPC
      ? await addJobViaRPC(newJobDetails)
      : await addJob(newJobDetails);

    if (jobId) {
      Alert.alert('Success', `Job posted successfully${useRPC ? ' via RPC' : ''}`);
      setModalVisible(false);
      resetForm();
    } else {
      Alert.alert('Error', `Failed to post job${useRPC ? ' via RPC' : ''}`);
    }
  };

  const handleDeleteJob = async (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteJob(id);
            if (success) {
              Alert.alert('Success', 'Job deleted successfully');
            } else {
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };
  const resetForm = () => {
    setJobTitle('');
    setJobDescription('');
    setJobLocation('');
    setJobSalary('');
    setJobSalaryType('per_hour');
    setJobType('part_time');
    setJobStartDate('');
    setJobEndDate('');
    setJobRequirements('');
    setJobBenefits('');
    setJobSlotsAvailable('1');
    setJobTags('');
    // Reset date picker states
    setStartDate(new Date());
    setEndDate(new Date());
    setHasEndDate(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };
  const renderJobItem = ({ item }: { item: JobDetails }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobCardHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteJob(item.id!)}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <Text style={styles.jobLocation}>
        📍 {item.location}
      </Text>
      <Text style={styles.jobSalary}>
        💰 {item.salary} ({item.salaryType?.replace('_', ' ') || 'Unknown'})
      </Text>
      <Text numberOfLines={2} style={styles.jobDescription}>
        {item.description}
      </Text>
      <View style={styles.jobMeta}>
        <View style={styles.jobTypeBadge}>
          <Text style={styles.jobTypeText}>{item.jobType?.replace('_', ' ') || 'Unknown'}</Text>
        </View>
        <Text style={styles.jobSlots}>
          👥 {item.slots_filled || 0}/{item.slotsAvailable} filled
        </Text>
      </View>
      <View style={styles.tagsContainer}>
        {item.tags?.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )) || null}
      </View>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Jobs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Post Job</Text>
        </TouchableOpacity>
      </View>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={24} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={item => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="briefcase" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No jobs posted yet</Text>
              <Text style={styles.emptySubText}>
                Tap the "Post Job" button to create your first job listing
              </Text>
            </View>
          }
        />
      )}
      {/* Add Job Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post New Job</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={jobTitle}
                onChangeText={setJobTitle}
                placeholder="e.g. Barista, Delivery Driver"
              />
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={jobDescription}
                onChangeText={setJobDescription}
                placeholder="Describe the job responsibilities and duties"
                multiline
                numberOfLines={4}
              />
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                value={jobLocation}
                onChangeText={setJobLocation}
                placeholder="e.g. Hanoi, District 1"
              />
              <Text style={styles.inputLabel}>Salary *</Text>
              <View style={styles.rowContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={jobSalary}
                  onChangeText={setJobSalary}
                  placeholder="e.g. 50,000 VND"
                  keyboardType="numeric"
                />
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => {
                      // In a real app, you would show a proper picker here
                      const types: JobSalaryType[] = ['per_hour', 'per_shift', 'per_day', 'fixed', 'negotiable'];
                      const currentIndex = types.indexOf(jobSalaryType);
                      const nextIndex = (currentIndex + 1) % types.length;
                      setJobSalaryType(types[nextIndex]);
                    }}                  >
                    <Text style={styles.pickerText}>{jobSalaryType?.replace('_', ' ') || 'per hour'}</Text>
                    <Feather name="chevron-down" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.inputLabel}>Job Type</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => {
                    // In a real app, you would show a proper picker here
                    const types: JobType[] = ['part_time', 'full_time', 'internship', 'freelance', 'urgent'];
                    const currentIndex = types.indexOf(jobType);
                    const nextIndex = (currentIndex + 1) % types.length;
                    setJobType(types[nextIndex]);
                  }}
                >
                  <Text style={styles.pickerText}>{jobType?.replace('_', ' ') || 'part time'}</Text>
                  <Feather name="chevron-down" size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Start Date *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString('en-GB')}
                </Text>
                <Feather name="calendar" size={16} color="#6b7280" />
              </TouchableOpacity>

              <View style={styles.endDateContainer}>
                <View style={styles.endDateHeader}>
                  <Text style={styles.inputLabel}>End Date</Text>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setHasEndDate(!hasEndDate)}
                  >
                    {hasEndDate && <Feather name="check" size={16} color="#10b981" />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>Set end date</Text>
                </View>
                {hasEndDate && (
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {endDate.toLocaleDateString('en-GB')}
                    </Text>
                    <Feather name="calendar" size={16} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.inputLabel}>Requirements</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={jobRequirements}
                onChangeText={setJobRequirements}
                placeholder="List job requirements, qualifications, etc."
                multiline
                numberOfLines={3}
              />
              <Text style={styles.inputLabel}>Benefits</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={jobBenefits}
                onChangeText={setJobBenefits}
                placeholder="List benefits, perks, etc."
                multiline
                numberOfLines={3}
              />
              <Text style={styles.inputLabel}>Number of Positions</Text>
              <TextInput
                style={styles.input}
                value={jobSlotsAvailable}
                onChangeText={setJobSlotsAvailable}
                placeholder="How many positions are available?"
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={jobTags}
                onChangeText={setJobTags}
                placeholder="e.g. cafe, delivery, urgent"
              />
              {/* API Method Toggle */}
              <View style={styles.toggleContainer}>
                <Text style={styles.inputLabel}>Use RPC Method</Text>
                <TouchableOpacity
                  style={[styles.toggle, useRPC ? styles.toggleActive : styles.toggleInactive]}
                  onPress={() => setUseRPC(!useRPC)}
                >
                  <View style={[styles.toggleHandle, useRPC ? styles.toggleHandleActive : styles.toggleHandleInactive]} />
                </TouchableOpacity>
                <Text style={styles.toggleText}>
                  {useRPC ? 'Using RPC API call' : 'Using direct database insertion'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddJob}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather name="check-circle" size={18} color="#ffffff" />
                    <Text style={styles.submitButtonText}>Post Job</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
            {/* Date Pickers */}
            <DatePicker
              modal
              open={showStartDatePicker}
              date={startDate}
              minimumDate={new Date()}
              onConfirm={(date) => {
                setShowStartDatePicker(false);
                setStartDate(date);
                // If end date is before new start date, update it
                if (hasEndDate && endDate <= date) {
                  const nextDay = new Date(date);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setEndDate(nextDay);
                }
              }}
              onCancel={() => {
                setShowStartDatePicker(false);
              }}
              mode="date"
              title="Select Start Date"
            /><DatePicker
              modal
              open={showEndDatePicker}
              date={endDate}
              minimumDate={startDate}
              onConfirm={(date) => {
                setShowEndDatePicker(false);
                setEndDate(date);
              }}
              onCancel={() => {
                setShowEndDatePicker(false);
              }}
              mode="date"
              title="Select End Date"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  jobLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  jobSalary: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTypeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  jobTypeText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '500',
  },
  jobSlots: {
    fontSize: 14,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4b5563',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  toggleContainer: {
    marginBottom: 20,
  },
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 3,
    marginVertical: 8,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleInactive: {
    backgroundColor: '#d1d5db',
  },
  toggleHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  toggleHandleActive: {
    backgroundColor: '#ffffff',
    transform: [{ translateX: 24 }],
  },
  toggleHandleInactive: {
    backgroundColor: '#ffffff',
    transform: [{ translateX: 0 }],
  }, toggleText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  dateInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  endDateContainer: {
    marginBottom: 16,
  },
  endDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
});
