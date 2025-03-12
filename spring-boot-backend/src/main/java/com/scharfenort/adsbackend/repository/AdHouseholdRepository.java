package com.scharfenort.adsbackend.repository;

import com.scharfenort.adsbackend.model.AdHousehold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdHouseholdRepository extends JpaRepository<AdHousehold, Long> {
}
