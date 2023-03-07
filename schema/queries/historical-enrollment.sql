select xref1.secondary_host_id as [Host ID] , dub2.email as [Student Email] , ce1.student_user_id as [Student User ID] , dub2.preferred_or_first_name as [Student First Name] , dub2.lastname as [Student Last Name] , dub2.grad_year as [Student Grad Year] , dat1.school_year as [School Year] , dcb1.course_code as [Course Code] , dcb1.course_title as [Course Title (with term)] , dcb1.course_length as [Length] , dag1.group_identifier as [Group Identifier] , dag1.course_id as [Course ID] , daf1.faculty_user_id as [Faculty User ID] , dub1.preferred_or_first_name as [Faculty First Name] , dub1.lastname as [Faculty Last Name] , aca1.department as [Department] from
dbo.da_academic_group(@p1)dag1 INNER JOIN dbo.da_course_base(@p1)dcb1 ON dcb1.course_id = dag1.course_id INNER JOIN dbo.da_course_department(@p1)cd1 ON cd1.course_id = dcb1.course_id INNER JOIN dbo.da_academic_department(@p1)aca1 ON aca1.department_id = cd1.department_id INNER JOIN dbo.da_academic_term(@p1)dat1 ON dat1.term_id = dag1.term_id And dat1.school_year IN (select [value] from dbo.fn_convertlisttosetstr('2018 - 2019,2019 - 2020,2020 - 2021,2021 - 2022,2022 - 2023',',')) INNER JOIN dbo.da_academic_faculty(@p1)daf1 ON daf1.group_id = dag1.group_id INNER JOIN dbo.da_user_base(@p1)dub1 ON dub1.user_id = daf1.faculty_user_id INNER JOIN dbo.da_academic_enrollment(@p1)ce1 ON ce1.group_id = dag1.group_id INNER JOIN dbo.da_user_base(@p1)dub2 ON dub2.user_id = ce1.student_user_id INNER JOIN dbo.da_user_role(@p1)dur1 ON dur1.user_id = dub2.user_id INNER JOIN dbo.da_user_secondary_host_id(@p1)xref1 ON xref1.user_id = dub2.user_id INNER JOIN dbo.da_academic_block(@p1)dab1 ON dab1.block_id = dag1.block_id LEFT OUTER JOIN dbo.da_academic_room(@p1)dar1 ON dar1.room_id = dag1.room_id
where daf1.head = 1 And dur1.role IN (select [value] from dbo.fn_convertlisttosetstr('Student',',')) And ce1.student_user_id <> '6813240' And ce1.student_user_id <> '6813526' And ce1.student_user_id <> '4641975' And cd1.department_id <> '37786'
group by xref1.secondary_host_id , dub2.email , ce1.student_user_id , dub2.preferred_or_first_name , dub2.lastname , dub2.grad_year , dat1.school_year , dcb1.course_code , dcb1.course_title , dcb1.course_length , dag1.group_identifier , dag1.course_id , daf1.faculty_user_id , dub1.preferred_or_first_name , dub1.lastname , aca1.department
order by dub2.lastname ASC , dub2.preferred_or_first_name ASC , dat1.school_year ASC
