import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import EHeader from '../../../components/common/EHeader';
import EInput from '../../../components/common/EInput';
import { styles } from '../../../themes';
import { Dropdown } from 'react-native-element-dropdown';
import { LeaveType } from '../../../api/constant';
import { getHeight, moderateScale } from '../../../common/constants';
import EButton from '../../../components/common/EButton';
import moment from 'moment';
import { StackNav } from '../../../navigation/NavigationKeys';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import EText from '../../../components/common/EText';
import api from '../../../api/api';

const RequestLeave = ({route}) => {
  const navigation = useNavigation();
  const colors = useSelector(state => state.theme.theme);
  const BlurredStyle = {
    backgroundColor: colors.inputBg,
    borderColor: colors.backgroundColor,
  };
  const FocusedStyle = {
    backgroundColor: colors.inputBg,
    borderColor: colors.backgroundColor,
    color: colors.textColor
  };
  const [leaveType, setLeaveType] = useState('');
  const [totalDaysInputStyle, SetTotalDaysInputStyle] = useState(BlurredStyle);
  const [totalDays, SetTotalDays] = useState('');
  const [reason, setReason] = useState('');

  const onFocusInput = onHighlight => onHighlight(FocusedStyle);
  const onBlurInput = onHighlight => onHighlight(FocusedStyle);
  const onChangedLeaveType = text => setLeaveType(text.value);
  const onChangedtotalDays = text => SetTotalDays(text);
  const onChangedReason = text => setReason(text);
  const onFocustotalDays = () => onFocusInput(SetTotalDaysInputStyle);
  const onBlurtotalDays = () => onBlurInput(SetTotalDaysInputStyle);

  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isFullDay, setIsFullDay] = useState(true);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const handleStartDateConfirm = (date) => {
    const formattedDate = formatDate(date);
    setStartDate(formattedDate);
  
    if (endDate) {
      calculateTotalDays(date, endDate);
    }
  
    setStartDatePickerVisible(false);
  };
  
  const handleEndDateConfirm = (date) => {
    const formattedDate = formatDate(date);
    setEndDate(formattedDate);
  
    if (startDate) {
      calculateTotalDays(startDate, date);
    }
  
    setEndDatePickerVisible(false);
  };
  
  // Function to calculate total days
  const calculateTotalDays = (start, end) => {
    const startMoment = moment(start, "DD-MM-YYYY");
    const endMoment = moment(end, "DD-MM-YYYY");
    
    if (endMoment.isBefore(startMoment)) {
      Alert.alert("End date cannot be before start date.");
      return;
    }
  
    const daysDiff = endMoment.diff(startMoment, "days") + 1; // +1 to include start day
    SetTotalDays(daysDiff.toString());
  };
  

  const formatDate = date => {
    const formattedDate = date.toISOString().split('T')[0];
    const day = formattedDate.split('-')[2];
    const month = formattedDate.split('-')[1];
    const year = formattedDate.split('-')[0];
    return day + '-' + month + '-' + year;
  };

  const hideStartDatePicker = () => setStartDatePickerVisible(false);
  const hideEndDatePicker = () => setEndDatePickerVisible(false);

  const onPressStartDate = () => setStartDatePickerVisible(true);
  const onPressEndDate = () => setEndDatePickerVisible(true);

  const toggleFullDay = () => {
    setIsFullDay(!isFullDay);
    setIsHalfDay(false);
  };

  const toggleHalfDay = () => {
    setIsHalfDay(!isHalfDay);
    setIsFullDay(false);
  };

  const onPressSubmit = () => {

    const formData = {
      no_of_days:totalDays,
      leave_type:leaveType,
      from_date:startDate,
      to_date:endDate,
      isFullDay,
      isHalfDay,
      reason,
      employee_id: route.params.staff_id,
      creation_date:moment().format('DD-MMM-YYYY')
    };

    if (!leaveType || !startDate || !endDate) {
      Alert.alert('Please fill in all required fields.');
      return;
    }

    api
        .post('/leave/insertLeave', formData)
        .then(() => {
          Alert.alert('Leave Request sent successfully.');
          navigation.navigate(StackNav.ViewLeaves);
        })
        .catch(error => {
          console.log('Error: ', error);
        });
  };

  return (
    <View style={{ backgroundColor: '#fafafa', flex: 1 }}>
      <EHeader title={'Request Leave'} />
      <ScrollView contentContainerStyle={localStyles.scrollViewContainer}>
        <View style={localStyles.contentContainerStyle}>


          <Dropdown
            style={[
              localStyles.dropdownStyle,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.backgroundColor,
                color: colors.white,
              },
            ]}
            placeholderStyle={{ color: colors.grayScale5 }}
            data={LeaveType}
            maxHeight={moderateScale(180)}
            labelField="label"
            valueField="value"
            placeholder="Leave Type"
            value={leaveType}
            itemTextStyle={{
              color: colors.textColor,
              fontSize: moderateScale(16),
            }}
            onChange={onChangedLeaveType}
            selectedTextStyle={{
              color: colors.textColor,
            }}
            itemContainerStyle={{
              backgroundColor: colors.inputBg,
            }}
            activeColor={colors.inputBg}
          />

          <DateTimePickerModal
            isVisible={startDatePickerVisible}
            mode="date"
            onConfirm={handleStartDateConfirm}
            onCancel={hideStartDatePicker}
            date={new Date()}
            minimumDate={new Date()}
          />

          <DateTimePickerModal
            isVisible={endDatePickerVisible}
            mode="date"
            onConfirm={handleEndDateConfirm}
            onCancel={hideEndDatePicker}
            date={new Date()}
            minimumDate={new Date()}
          />

          


          <View style={localStyles.rowContainer}>
            <TouchableOpacity
              onPress={onPressStartDate}
              style={[
                localStyles.datePickerStyle,
                totalDaysInputStyle
              ]}
              _onFocus={onFocustotalDays}
              onBlur={onBlurtotalDays}
            >
              <EText
                type={'r16'}
                color={startDate ? colors.textColor : colors.grayScale5}>
                {startDate ? startDate : 'Start Date'}
              </EText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onPressEndDate}
              style={[
                localStyles.datePickerStyle,
                totalDaysInputStyle
              ]}>
              <EText
                type={'r16'}
                color={endDate ? colors.textColor : colors.grayScale5}>
                {endDate ? endDate : 'End Date'}
              </EText>
            </TouchableOpacity>
          </View>
          <EInput
            placeHolder={'Total Days'}
            _value={totalDays}
            style={{ color: colors.placeHolderColor }}
             labelField="label"
            valueField="value"
            autoCapitalize={'none'}
            onChangeText={onChangedtotalDays}
            inputContainerStyle={[
              { backgroundColor: colors.inputBg },
              localStyles.inputContainerStyle,
              totalDaysInputStyle,
            ]}
            _onFocus={onFocustotalDays}
            onBlur={onBlurtotalDays}
          />

          <View style={localStyles.rowContainer}>
            <TouchableOpacity
              onPress={toggleFullDay}
              style={[
                localStyles.toggleButtonStyle,
                totalDaysInputStyle,
                { backgroundColor: isFullDay ? colors.backgroundColor : colors.inputBg },
              ]}
            >
              <EText
                type={'r16'}
                color={isFullDay ? colors.white : colors.grayScale5}
              >
                Full Day
              </EText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleHalfDay}
              style={[
                localStyles.toggleButtonStyle,
                totalDaysInputStyle,
                { backgroundColor: isHalfDay ? colors.backgroundColor : colors.inputBg },
              ]}
            >
              <EText
                type={'r16'}
                color={isHalfDay ? colors.white : colors.grayScale5}
              >
                Half-Day
              </EText>
            </TouchableOpacity>
          </View>

          <EInput
            placeholder="Reason"
            value={reason}
            style={{ color: colors.placeHolderColor }}
            autoCapitalize={'none'}
            onChangeText={onChangedReason}
            inputContainerStyle={[
              localStyles.textInputStyle,
              { backgroundColor: colors.inputBg, borderColor: colors.backgroundColor },
            ]}
            multiline
            _onFocus={onFocustotalDays}
            onBlur={onBlurtotalDays}
          />
        </View>
      </ScrollView>
      <EButton
            type={'S16'}
            title={'Submit Request'}
            color={colors.white}
            onPress={onPressSubmit}
            containerStyle={localStyles.continueBtnStyle}
          />
    </View>
  );
};

export default RequestLeave;

const localStyles = StyleSheet.create({
  contentContainerStyle: {
    ...styles.ph25,
    ...styles.pv20,
  },
  space: {
    ...styles.pv10,
  },
  dropdownStyle: {
    height: getHeight(60),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(1),
    ...styles.ph25,
    ...styles.mv15,
  },
  continueBtnStyle: {
    ...styles.mb10,
    ...styles.mh15,
  },
  inputContainerStyle: {
    height: getHeight(60),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(1),
    ...styles.ph15,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: moderateScale(10),
  },

  datePickerStyle: {
    flex: 1,
    height: getHeight(60),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(1),
    ...styles.ph15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },

  toggleButtonStyle: {
    flex: 1,
    height: getHeight(60),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(1),
    ...styles.ph15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: moderateScale(10),
  },

  textInputStyle: {
    height: getHeight(100),
    borderRadius: moderateScale(5),
    borderWidth: moderateScale(1),
    ...styles.ph15,
    ...styles.pv10,
  },
});
