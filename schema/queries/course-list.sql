select dcb1.course_id as [Course ID] , dcb1.course_code as [Course Code] , dcb1.course_title as [Course Title (with term)] , aca1.department as [Department] , dcd1.description as [Description] from
dbo.da_course_base(@p1)dcb1 INNER JOIN dbo.da_course_department(@p1)cd1 ON cd1.course_id = dcb1.course_id INNER JOIN dbo.da_academic_department(@p1)aca1 ON aca1.department_id = cd1.department_id INNER JOIN dbo.da_course_detail(@p1)dcd1 ON dcd1.course_id = dcb1.course_id
where dcb1.inactive = 0 And dcb1.publish_ind = 1
